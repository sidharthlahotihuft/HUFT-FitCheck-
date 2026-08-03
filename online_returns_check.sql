/* ONLINE returns via credit notes. Read-only, one statement, no blank lines. */
SELECT 'A. posted credit notes (out_refund)' AS step,
       (SELECT count(*) FROM account_move WHERE move_type='out_refund' AND state='posted')::bigint AS n,
       ''::text AS detail
UNION ALL
SELECT 'B. ... in the last 12 months',
       (SELECT count(*) FROM account_move WHERE move_type='out_refund' AND state='posted'
        AND invoice_date >= (CURRENT_DATE - INTERVAL '12 months'))::bigint, ''
UNION ALL
SELECT 'C. credit notes that name the invoice they reverse',
       (SELECT count(*) FROM account_move WHERE move_type='out_refund' AND reversed_entry_id IS NOT NULL)::bigint, ''
UNION ALL
SELECT 'D. credit note LINES carrying a product',
       (SELECT count(*) FROM account_move_line aml JOIN account_move am ON am.id=aml.move_id
        WHERE am.move_type='out_refund' AND am.state='posted' AND aml.product_id IS NOT NULL)::bigint, ''
UNION ALL
SELECT 'E. does the sale-line to invoice-line link table exist and have rows?',
       (SELECT count(*) FROM sale_order_line_invoice_rel)::bigint, 'links a credit note line back to the order line'
UNION ALL
SELECT 'F. credit note lines that reach a SALE ORDER LINE',
       (SELECT count(*) FROM account_move_line aml
        JOIN account_move am ON am.id=aml.move_id
        JOIN sale_order_line_invoice_rel r ON r.invoice_line_id = aml.id
        WHERE am.move_type='out_refund' AND am.state='posted')::bigint, 'this is the link we want'
UNION ALL
SELECT 'G. ... and whose order is a SHOPIFY order',
       (SELECT count(*) FROM account_move_line aml
        JOIN account_move am ON am.id=aml.move_id
        JOIN sale_order_line_invoice_rel r ON r.invoice_line_id = aml.id
        JOIN sale_order_line sol ON sol.id = r.order_line_id
        JOIN sale_order so ON so.id = sol.order_id
        WHERE am.move_type='out_refund' AND am.state='posted'
          AND so.shopify_instance_id IS NOT NULL)::bigint, 'ONLINE returns, line level'
UNION ALL
SELECT 'H. ... in the last 12 months',
       (SELECT count(*) FROM account_move_line aml
        JOIN account_move am ON am.id=aml.move_id
        JOIN sale_order_line_invoice_rel r ON r.invoice_line_id = aml.id
        JOIN sale_order_line sol ON sol.id = r.order_line_id
        JOIN sale_order so ON so.id = sol.order_id
        WHERE am.move_type='out_refund' AND am.state='posted'
          AND so.shopify_instance_id IS NOT NULL
          AND am.invoice_date >= (CURRENT_DATE - INTERVAL '12 months'))::bigint, ''
UNION ALL
SELECT 'I. is a reason recorded on the credit note?', NULL::bigint,
       string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_schema='public' AND table_name='account_move'
  AND (column_name ILIKE '%reason%' OR column_name ILIKE '%ref%' OR column_name ILIKE '%narration%')
ORDER BY 1;
