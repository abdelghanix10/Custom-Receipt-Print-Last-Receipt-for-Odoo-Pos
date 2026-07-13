/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { patch } from "@web/core/utils/patch";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";

// Cache printer name at module level so getDefault() is only called once per session
let _cachedLastReceiptPrinterName = null;

export class PrintLastReceiptButton extends Component {
  static template = "custom_receipts_for_pos.PrintLastReceiptButton";
  static props = {
    "*": true,
  };

  setup() {
    this.pos = usePos();
    this.printer = useService("printer");
    this.notification = useService("notification");
  }

  async onClick() {
    // Get the last paid order from the current session
    const orders = this.pos.models["pos.order"].getAll();

    // Filter for paid orders and get the last one
    const paidOrders = orders.filter(
      (order) =>
        order.state === "paid" ||
        order.state === "done" ||
        order.state === "invoiced",
    );

    if (paidOrders.length === 0) {
      this.notification.add(_t("No paid orders found to print."), {
        type: "warning",
      });
      return;
    }

    // Get the last paid order
    const lastOrder = paidOrders[paidOrders.length - 1];

    try {
      // Build receipt data manually for Odoo 19
      // Debug: Log the order structure to understand what we're working with

      // Get order lines - handle various Odoo 19 data structures
      let orderLines = [];

      // Try different ways to access order lines
      if (lastOrder.lines) {
        // Could be array, Collection, or Set
        if (Array.isArray(lastOrder.lines)) {
          orderLines = lastOrder.lines;
        } else if (typeof lastOrder.lines.getAll === "function") {
          orderLines = lastOrder.lines.getAll();
        } else if (typeof lastOrder.lines.map === "function") {
          orderLines = [...lastOrder.lines];
        } else if (typeof lastOrder.lines[Symbol.iterator] === "function") {
          orderLines = [...lastOrder.lines];
        }
      } else if (lastOrder.line_ids) {
        if (Array.isArray(lastOrder.line_ids)) {
          orderLines = lastOrder.line_ids;
        } else if (typeof lastOrder.line_ids.getAll === "function") {
          orderLines = lastOrder.line_ids.getAll();
        } else if (typeof lastOrder.line_ids[Symbol.iterator] === "function") {
          orderLines = [...lastOrder.line_ids];
        }
      }

      // Get payment lines
      let paymentLines = [];
      if (lastOrder.payment_ids) {
        if (Array.isArray(lastOrder.payment_ids)) {
          paymentLines = lastOrder.payment_ids;
        } else if (typeof lastOrder.payment_ids.getAll === "function") {
          paymentLines = lastOrder.payment_ids.getAll();
        } else if (
          typeof lastOrder.payment_ids[Symbol.iterator] === "function"
        ) {
          paymentLines = [...lastOrder.payment_ids];
        }
      } else if (lastOrder.payments) {
        if (Array.isArray(lastOrder.payments)) {
          paymentLines = lastOrder.payments;
        } else if (typeof lastOrder.payments.getAll === "function") {
          paymentLines = lastOrder.payments.getAll();
        } else if (typeof lastOrder.payments[Symbol.iterator] === "function") {
          paymentLines = [...lastOrder.payments];
        }
      }

      // Build orderlines data for the receipt with unique keys
      const orderlinesData = orderLines.map((line, index) => {
        // Handle Model objects, plain objects, and IDs
        let lineData = line;
        if (typeof line === "number" || typeof line === "string") {
          lineData = this.pos.models["pos.order.line"]?.get(line) || {};
        }

        // Access product name through various possible paths
        let productName = "Product";
        if (lineData.full_product_name) {
          productName = lineData.full_product_name;
        } else if (lineData.product_id) {
          if (typeof lineData.product_id === "object") {
            productName =
              lineData.product_id.display_name ||
              lineData.product_id.name ||
              "Product";
          } else if (typeof lineData.product_id === "number") {
            const product = this.pos.models["product.product"]?.get(
              lineData.product_id,
            );
            productName = product?.display_name || product?.name || "Product";
          }
        }

        return {
          id: lineData.id || `line_${index}`,
          productName: productName,
          qty: lineData.qty || lineData.quantity || 0,
          price: this.env.utils.formatCurrency(
            lineData.price_subtotal_incl || lineData.price_unit || 0,
          ),
          discount: lineData.discount || 0,
          customerNote: lineData.customer_note || lineData.note || "",
          price_subtotal_incl: lineData.price_subtotal_incl || 0,
          price_subtotal: lineData.price_subtotal || 0,
          price_unit: lineData.price_unit || 0,
        };
      });

      // Build payment lines data with unique keys - filter out negative amounts (change)
      const paymentlinesData = paymentLines
        .filter((payment) => {
          let paymentData = payment;
          if (typeof payment === "number" || typeof payment === "string") {
            paymentData = this.pos.models["pos.payment"]?.get(payment) || {};
          }
          const amount = paymentData.amount || 0;
          return amount > 0; // Filter out negative amounts (change)
        })
        .map((payment, index) => {
          let paymentData = payment;
          if (typeof payment === "number" || typeof payment === "string") {
            paymentData = this.pos.models["pos.payment"]?.get(payment) || {};
          }

          // Access payment method name through various possible paths
          let paymentName = "Payment";
          if (paymentData.payment_method_id) {
            if (typeof paymentData.payment_method_id === "object") {
              paymentName = paymentData.payment_method_id.name || "Payment";
            } else if (typeof paymentData.payment_method_id === "number") {
              const method = this.pos.models["pos.payment.method"]?.get(
                paymentData.payment_method_id,
              );
              paymentName = method?.name || "Payment";
            }
          } else if (paymentData.name) {
            paymentName = paymentData.name;
          }

          return {
            id: paymentData.id || `payment_${index}`,
            name: paymentName,
            amount: paymentData.amount || 0,
          };
        });

      // Extract tax details from the order
      let tax_details = [];
      const taxLines = lastOrder.tax_ids || [];

      if (Array.isArray(taxLines) && taxLines.length > 0) {
        tax_details = taxLines;
      } else if (
        typeof taxLines === "object" &&
        taxLines !== null &&
        Object.keys(taxLines).length > 0
      ) {
        tax_details = Object.entries(taxLines).map(([key, value], idx) => ({
          id: `tax_${idx}`,
          tax: { name: key },
          amount: Math.round(value * 100) / 100,
        }));
      }

      // We only want to show total_tax, not individual tax lines
      const amount_tax = Math.round((lastOrder.amount_tax || 0) * 100) / 100;

      // Build company data
      const companyData = {
        id: this.pos.company.id,
        name: this.pos.company.name || "",
        street: this.pos.company.street || "",
        street2: this.pos.company.street2 || "",
        city: this.pos.company.city || "",
        zip: this.pos.company.zip || "",
        state: this.pos.company.state_id ? this.pos.company.state_id[1] : "",
        country: this.pos.company.country_id
          ? this.pos.company.country_id[1]
          : "",
        vat: this.pos.company.vat || "",
        phone: this.pos.company.phone || "",
        email: this.pos.company.email || "",
        website: this.pos.company.website || "",
        logo: this.pos.company.logo || null,
        contact_address: this.pos.company.contact_address || "",
      };

      // Format the date properly
      let formattedDate = "";
      const rawDate = lastOrder.date_order;
      if (rawDate) {
        try {
          const dateObj = new Date(rawDate);
          formattedDate =
            dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
        } catch (e) {
          formattedDate = rawDate;
        }
      } else {
        formattedDate =
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString();
      }

      // Build receipt data
      const receiptData = {
        name: lastOrder.name || lastOrder.pos_reference || "",
        date: formattedDate,
        orderlines: orderlinesData,
        paymentlines: paymentlinesData,
        amount_total: Math.round((lastOrder.amount_total || 0) * 100) / 100,
        total_with_tax: Math.round((lastOrder.amount_total || 0) * 100) / 100,
        total_without_tax:
          Math.round(
            ((lastOrder.amount_total || 0) - (lastOrder.amount_tax || 0)) * 100,
          ) / 100,
        amount_tax: amount_tax,
        change: Math.round((lastOrder.amount_return || 0) * 100) / 100,
        tax_details: [], // Empty - we only show total_tax
        taxDetails: [], // Alias for potential default template usage
        total_tax: amount_tax,
        company: companyData,
        cashier: this.pos.cashier?.name || this.pos.user?.name || "",
        headerData: {
          company: companyData,
          cashier: this.pos.cashier?.name || this.pos.user?.name || "",
          header: this.pos.config.receipt_header || "",
        },
        last_receipt: true,
        order: lastOrder,
      };

      // Always use OrderReceipt component - the patch will handle which design to use
      // In Odoo 19, OrderReceipt expects only 'order' prop
      // We use Object.create(lastOrder) to preserve the original order's prototype (methods, etc)
      // and attach/override our receipt data and mock methods
      const orderWithReceiptData = Object.create(lastOrder);

      // Assign our custom properties and mocks to the wrapper
      Object.assign(orderWithReceiptData, {
        receiptData: receiptData,
        // We might want to override name/date if they differ from model
        // but usually keeping model's is safer if they exist.
        // We add them just in case.
        name: lastOrder.name || receiptData.name,
        date_order: lastOrder.date_order || receiptData.date,

        // Mock/Override methods expected by OrderReceipt
        getReceiptHeaderData: () => receiptData.headerData,

        // Ensure these return our formatted data
        get_orderlines: () => receiptData.orderlines,
        get_paymentlines: () => receiptData.paymentlines,
        get_total_with_tax: () => receiptData.amount_total,
        get_total_without_tax: () => receiptData.total_without_tax,
        get_total_tax: () => receiptData.amount_tax,
        get_tax_details: () => receiptData.tax_details,
        get_change: () => receiptData.change,
        // get_currency: () => this.pos.currency, // Use original if available

        // Properties that might be accessed directly
        tax_details: receiptData.tax_details,
        taxDetails: receiptData.tax_details,
      });

      // Check the print method setting
      const printMethod = this.pos.config.last_receipt_print_method || "chrome";

      if (printMethod === "qz_tray") {
        // Use QZ Tray for direct printing
        const qzService = this.env.services.qz_tray;

        if (!qzService) {
          this.notification.add(
            _t(
              "QZ Tray service not available. Please ensure the odoo_qz_print module is installed.",
            ),
            {
              type: "danger",
            },
          );
          return;
        }

        try {
          // Connect to QZ Tray
          await qzService.connect();

          const qzLib = qzService.getQZ();
          if (qzLib) {
            // Get the renderer service from env
            const renderer = this.env.services.renderer;

            // Render receipt to HTML using Odoo's renderer
            const receiptHtml = await renderer.toHtml(
              OrderReceipt,
              {
                order: orderWithReceiptData,
                data: receiptData,
              },
              { addClass: "pos-receipt-print" },
            );

            // Get HTML content
            const htmlContent = `<html>
              <head>
                <style>
                  body {
                      font-family: "Courier New", Courier, monospace; 
                      font-weight: bold;
                  }
                  table {
                      table-layout: fixed;
                      width: 100%;
                  }
                  .pos-receipt-print {
                      font-size: 14px; /* حجم خط مناسب للطابعات الحرارية */
                  }
                </style>
              </head>
              <body>${receiptHtml.outerHTML}</body>
              </html>`;

            // Get default printer once and cache it for all future prints
            if (!_cachedLastReceiptPrinterName) {
              _cachedLastReceiptPrinterName = await qzLib.printers.getDefault();
            }

            // Print using cached printer name — skipConnect=true because we already connected above
            await qzService.print(_cachedLastReceiptPrinterName, htmlContent, "pixel", {}, true);

            this.notification.add(
              _t("Last receipt printed successfully via QZ Tray for order: ") +
                (lastOrder.name || lastOrder.pos_reference),
              { type: "success" },
            );
          } else {
            throw new Error("QZ Tray library not loaded");
          }
        } catch (qzError) {
          console.error("QZ Tray print error:", qzError);
          this.notification.add(
            _t("QZ Tray print failed: ") + qzError.message,
            {
              type: "danger",
            },
          );
        }
      } else {
        // Use Chrome Preview (default browser print)
        const isPrinted = await this.printer.print(
          OrderReceipt,
          {
            order: orderWithReceiptData,
          },
          { webPrintFallback: true },
        );

        if (isPrinted) {
          this.notification.add(
            _t("Last receipt printed successfully for order: ") +
              (lastOrder.name || lastOrder.pos_reference),
            { type: "success" },
          );
        }
      }
    } catch (error) {
      this.notification.add(_t("Error printing receipt: ") + error.message, {
        type: "danger",
      });
    }
  }
}

// Patch ActionpadWidget to include the button component
patch(ActionpadWidget, {
  components: { ...ActionpadWidget.components, PrintLastReceiptButton },
});
