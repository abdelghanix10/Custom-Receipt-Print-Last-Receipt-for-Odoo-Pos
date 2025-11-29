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
    return {
      data: this.props.data,
      order: this.props.data.order || this.props.order || this.pos.get_order(),
      receipt: this.props.data,
      orderlines: this.props.data.orderlines,
      paymentlines: this.props.data.paymentlines,
    };
  },
  get templateComponent() {
    var mainRef = this;
    var receipt_design = mainRef.pos.config.design_receipt;
    var useCustom = mainRef.pos.config.is_custom_receipt;

    if (this.props.data.last_receipt) {
      receipt_design = mainRef.pos.config.last_design_receipt;
      useCustom = mainRef.pos.config.is_print_last_receipt;
    }

    // Only use custom design if the respective setting is enabled
    if (!useCustom) {
      return null; // Return null to use default OrderReceipt template
    }

    return class extends Component {
      setup() {}
      static template = xml`${receipt_design}`;
    };
  },
  get isTrue() {
    // For last receipt, check is_print_last_receipt
    if (this.props.data && this.props.data.last_receipt) {
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
