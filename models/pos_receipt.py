from odoo import fields, models


class PosReceipt(models.Model):
    """
        This is an Odoo model for Point of Sale (POS).
        It creates a new model of pos.receipt for providing different types of
        receipt design.
    """
    _name = 'pos.receipt'
    _description = 'POS Receipts'

    name = fields.Char(string='Name', help='Name of the pos receipt')
    design_receipt = fields.Text(string='Receipt XML',
                                 help='Add your customised receipts for pos')
    open_cash_drawer_only = fields.Boolean(
        string='Open Cash Drawer Only',
        help='When enabled, validating an order will open the cash drawer '
             'instead of printing a receipt. Requires QZ Tray integration.'
    )
