/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { patch } from "@web/core/utils/patch";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";

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
        order.state === "invoiced"
    );

    if (paidOrders.length === 0) {
      this.notification.add(_t("No paid orders found to print."), {
        type: "warning",
      });
      return;
    }

    // Get the last paid order
    const lastOrder = paidOrders[paidOrders.length - 1];

    // Print using default Odoo receipt (not custom design)
    try {
      const receiptData = lastOrder.export_for_printing();
      receiptData.last_receipt = true;
      // Force use of default template by not using custom receipt
      const isPrinted = await this.printer.print(
        OrderReceipt,
        {
          data: receiptData,
          formatCurrency: this.env.utils.formatCurrency,
        },
        { webPrintFallback: true }
      );

      if (isPrinted) {
        this.notification.add(
          _t("Last receipt printed successfully for order: ") + lastOrder.name,
          {
            type: "success",
          }
        );
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
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
