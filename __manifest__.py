{
    'name': 'Custom POS Receipt Design & Last Receipt',
    'version': '19.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Customize POS receipt designs and print last receipt with one click',
    'description': """
        Custom POS Receipt Design & Last Receipt
        ========================================
        
        Enhance your Point of Sale experience with custom receipt designs and convenient last receipt printing functionality.
        
        Key Features:
        -------------
        * **Multiple Receipt Designs**: Choose from pre-designed receipt templates
        * **Custom Receipt Layouts**: Personalize receipt appearance and branding
        * **Print Last Receipt**: One-click button to reprint the most recent receipt
        * **Smart Order Detection**: Automatically identifies the last paid order
        * **Error Handling**: Clear notifications for success and error states
        * **Easy Configuration**: Simple setup through POS configuration
        * **Seamless Integration**: Works with existing POS workflow
        
        Perfect for:
        ------------
        * Retail stores needing branded receipts
        * Restaurants with custom receipt requirements
        * Businesses requiring receipt reprints
        * Any POS setup wanting enhanced receipt functionality
        
        Installation:
        -------------
        1. Install the module
        2. Configure receipt design in POS settings
        3. Start using custom receipts and last receipt printing
    """,
    'author': 'Abdelghani X',
    'images': ['static/description/banner.png'],
    'depends': ['point_of_sale', 'odoo_qz_print', 'pos_print_second_receipt'],
    'data': [
        'security/ir.model.access.csv',
        'data/pos_receipt_design1_data.xml',
        'data/pos_receipt_design2_data.xml',
        'data/pos_receipt_design3_data.xml',
        'views/pos_receipt_views.xml',
        'views/pos_config_views.xml'
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'custom_receipts_and_last_receipt_for_pos/static/src/js/receipt_design.js',
            'custom_receipts_and_last_receipt_for_pos/static/src/js/print_last_receipt.js',
            'custom_receipts_and_last_receipt_for_pos/static/src/js/cash_drawer_pos.js',
            'custom_receipts_and_last_receipt_for_pos/static/src/xml/order_receipt.xml',
            'custom_receipts_and_last_receipt_for_pos/static/src/xml/print_last_receipt_button.xml',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False
}