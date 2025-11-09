from odoo import fields, models


class PosConfig(models.Model):
    """
        This is an Odoo model for Point of Sale (POS).
        It inherits the 'pos.config' model to add new fields.
    """
    _inherit = 'pos.config'

    receipt_design_id = fields.Many2one('pos.receipt', string='Receipt Design',
                                     help='Choose any receipt design')
    design_receipt = fields.Text(related='receipt_design_id.design_receipt',
                                 string='Receipt XML')
    logo = fields.Binary(related='company_id.logo', string='Logo',
                         readonly=False)
    is_custom_receipt = fields.Boolean(string='Is Custom Receipt',
                                       help='Indicates the receipt  design is '
                                            'custom or not')
    is_print_last_receipt = fields.Boolean(string='Is Print Last Receipt',
                                           help='Enable printing of last receipt')
    last_receipt_design_id = fields.Many2one(
        'pos.receipt', string='Last Receipt Design',
        help='Choose any receipt design for last receipt button')
    last_design_receipt = fields.Text(
        related='last_receipt_design_id.design_receipt',
        string='Last Receipt XML')
