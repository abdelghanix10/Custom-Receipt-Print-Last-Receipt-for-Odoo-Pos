/** @odoo-module */
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { patch } from "@web/core/utils/patch";
import { useState, Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

patch(OrderReceipt.prototype, {
  setup() {
    super.setup();
    this.state = useState({
      template: true,
    });
    this.pos = useState(useService("pos"));
  },

  get templateProps() {
    // Debug logging
    console.log("Receipt Design - props:", this.props);
    console.log("Receipt Design - props.order:", this.props.order);

    // Check if we have pre-built receipt data (from last receipt printing)
    const prebuiltData = this.props.data || this.props.order?.receiptData;

    if (prebuiltData && (prebuiltData.orderlines || prebuiltData.last_receipt)) {
      // Use pre-built receipt data (from print last receipt feature)
      console.log("Receipt Design - Using prebuilt data");
      const headerData = prebuiltData.headerData || {};
      const safeData = {
        ...prebuiltData,
        orderlines: prebuiltData.orderlines || [],
        paymentlines: prebuiltData.paymentlines || [],
        tax_details: prebuiltData.tax_details || [],
        amount_total: prebuiltData.amount_total || 0,
        total_with_tax: prebuiltData.total_with_tax || 0,
        total_without_tax: prebuiltData.total_without_tax || 0,
        change: prebuiltData.change || 0,
        name: prebuiltData.name || "",
        date: prebuiltData.date || "",
        headerData: {
          header: headerData.header || "",
          cashier: headerData.cashier || "",
          company: headerData.company || {},
          ...headerData,
        },
      };

      return {
        data: safeData,
        order: this.props.order,
        receipt: safeData,
        orderlines: safeData.orderlines,
        paymentlines: safeData.paymentlines,
      };
    }

    // For regular receipts, extract data from the live order object
    console.log("Receipt Design - Extracting from live order");
    const order = this.props.order;

    if (!order) {
      console.log("Receipt Design - No order found");
      return {
        data: {},
        order: null,
        receipt: { headerData: { header: "", cashier: "", company: {} } },
        orderlines: [],
        paymentlines: [],
      };
    }

    // Extract order lines from the order object
    let orderlines = [];
    const lines = order.lines || order.orderlines || order.get_orderlines?.() || [];
    console.log("Receipt Design - Raw lines:", lines);

    // Convert to array if needed
    let linesArray = [];
    if (Array.isArray(lines)) {
      linesArray = lines;
    } else if (typeof lines.getAll === 'function') {
      linesArray = lines.getAll();
    } else if (typeof lines[Symbol.iterator] === 'function') {
      linesArray = [...lines];
    }

    orderlines = linesArray.map((line, idx) => {
      // Handle both model objects and plain data
      let productName = "Product";
      if (line.full_product_name) {
        productName = line.full_product_name;
      } else if (line.get_full_product_name) {
        productName = line.get_full_product_name();
      } else if (line.product) {
        productName = line.product.display_name || line.product.name || "Product";
      } else if (line.product_id) {
        if (typeof line.product_id === 'object') {
          productName = line.product_id.display_name || line.product_id.name || "Product";
        }
      }

      const qty = line.quantity || line.qty || line.get_quantity?.() || 0;
      const price = line.price_subtotal_incl || line.get_display_price?.() || line.price || 0;
      const discount = line.discount || line.get_discount?.() || 0;

      return {
        id: line.id || `line_${idx}`,
        productName: productName,
        qty: qty,
        price: this.env.utils?.formatCurrency?.(price) || price,
        discount: discount,
        customerNote: line.customer_note || line.customerNote || "",
        price_subtotal_incl: price,
        price_subtotal: line.price_subtotal || price,
        price_unit: line.price_unit || line.get_unit_display_price?.() || 0,
      };
    });

    console.log("Receipt Design - Processed orderlines:", orderlines);

    // Extract payment lines - filter out negative amounts (these are change, not actual payments)
    let paymentlines = [];
    const payments = order.payment_ids || order.paymentlines || order.get_paymentlines?.() || [];

    let paymentsArray = [];
    if (Array.isArray(payments)) {
      paymentsArray = payments;
    } else if (typeof payments.getAll === 'function') {
      paymentsArray = payments.getAll();
    } else if (typeof payments[Symbol.iterator] === 'function') {
      paymentsArray = [...payments];
    }

    paymentlines = paymentsArray
      .filter((payment) => {
        // Filter out negative amounts (change) and zero amounts
        const amount = payment.amount || payment.get_amount?.() || 0;
        return amount > 0;
      })
      .map((payment, idx) => {
        let name = "Payment";
        if (payment.payment_method_id) {
          if (typeof payment.payment_method_id === 'object') {
            name = payment.payment_method_id.name || "Payment";
          }
        } else if (payment.name) {
          name = payment.name;
        } else if (payment.payment_method) {
          name = payment.payment_method.name || "Payment";
        }

        return {
          id: payment.id || `payment_${idx}`,
          name: name,
          amount: payment.amount || payment.get_amount?.() || 0,
        };
      });

    console.log("Receipt Design - Processed paymentlines:", paymentlines);

    // Extract tax details from the order
    let tax_details = [];
    const taxLines = order.tax_ids || order.get_tax_details?.() || [];

    if (Array.isArray(taxLines)) {
      tax_details = taxLines;
    } else if (typeof taxLines === 'object' && taxLines !== null) {
      // Convert tax object to array format expected by templates
      tax_details = Object.entries(taxLines).map(([key, value], idx) => ({
        id: `tax_${idx}`,
        tax: { name: key },
        amount: Math.round(value * 100) / 100,
      }));
    }

    // We only want to show total_tax, not individual tax lines
    // So we don't populate tax_details for the templates
    // Just calculate total_tax with proper rounding

    console.log("Receipt Design - Tax details:", tax_details);

    // Build the complete receipt data
    const amount_total = order.amount_total || order.get_total_with_tax?.() || 0;
    const amount_tax = order.amount_tax || order.get_total_tax?.() || 0;
    const change = order.amount_return || order.get_change?.() || 0;

    // Format the date properly
    let formattedDate = "";
    const rawDate = order.date_order || order.validation_date;
    if (rawDate) {
      try {
        const dateObj = new Date(rawDate);
        formattedDate = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
      } catch (e) {
        formattedDate = rawDate;
      }
    } else {
      formattedDate = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    }

    const receiptData = {
      name: order.name || order.pos_reference || "",
      date: formattedDate,
      orderlines: orderlines,
      paymentlines: paymentlines,
      amount_total: Math.round(amount_total * 100) / 100,
      total_with_tax: Math.round(amount_total * 100) / 100,
      total_without_tax: Math.round((amount_total - amount_tax) * 100) / 100,
      change: Math.round(change * 100) / 100,
      tax_details: [], // Empty - we only show total_tax
      total_tax: Math.round(amount_tax * 100) / 100,
      headerData: {
        header: this.pos.config?.receipt_header || "",
        cashier: this.pos.cashier?.name || this.pos.user?.name || "",
        company: this.pos.company || {},
      },
    };

    return {
      data: receiptData,
      order: order,
      receipt: receiptData,
      orderlines: orderlines,
      paymentlines: paymentlines,
    };
  },

  get templateComponent() {
    var mainRef = this;
    var receipt_design = mainRef.pos.config.design_receipt;
    var useCustom = mainRef.pos.config.is_custom_receipt;

    // Check if this is a last_receipt scenario (data may come from props.data or props.order.receiptData)
    const isLastReceipt = this.props.data?.last_receipt || this.props.order?.receiptData?.last_receipt;
    if (isLastReceipt) {
      receipt_design = mainRef.pos.config.last_design_receipt;
      useCustom = mainRef.pos.config.is_print_last_receipt;
    }

    // Only use custom design if the respective setting is enabled
    if (!useCustom) {
      return null; // Return null to use default OrderReceipt template
    }

    // Return component class with proper props declaration
    return class CustomReceiptDesign extends Component {
      static template = xml`${receipt_design}`;
      static props = ["*"];
      setup() { }
    };
  },

  get isTrue() {
    // Check if this is a last_receipt scenario
    const isLastReceipt = this.props.data?.last_receipt || this.props.order?.receiptData?.last_receipt;

    // For last receipt, check is_print_last_receipt
    if (isLastReceipt) {
      if (this.env.services.pos.config.is_print_last_receipt == false) {
        return true;
      }
      return false;
    }
    // For regular receipt, check is_custom_receipt
    if (this.env.services.pos.config.is_custom_receipt == false) {
      return true;
    }
    return false;
  },
});
