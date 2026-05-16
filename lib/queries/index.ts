import { query, queryOne, execute } from '../db'

// ─── USERS ────────────────────────────────────────────────────
export const userQueries = {
  findByEmail: (email: string) =>
    queryOne<any>('SELECT * FROM users WHERE email = ? AND active = 1', [email]),

  findByPhone: (phone: string) =>
    queryOne<any>('SELECT * FROM users WHERE phone = ? AND active = 1', [phone]),

  findById: (id: number) =>
    queryOne<any>('SELECT id, name, email, phone, role, active, created_at FROM users WHERE id = ?', [id]),

  findAll: () =>
    query<any>(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.role_id, u.active, u.created_at,
        r.name AS role_name, r.color AS role_color
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      ORDER BY u.created_at DESC
    `),

  create: (data: { name: string; email?: string; phone?: string; password_hash?: string; role: string }) =>
    execute('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, data.phone, data.password_hash, data.role]),

  update: (id: number, data: Partial<{ name: string; email: string; phone: string; role: string; active: number }>) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(data), id]
    return execute(`UPDATE users SET ${fields} WHERE id = ?`, values)
  },

  deactivate: (id: number) =>
    execute('UPDATE users SET active = 0 WHERE id = ?', [id]),
}

// ─── SELLERS ──────────────────────────────────────────────────
export const sellerQueries = {
  findAll: () =>
    query<any>(`
      SELECT s.*, u.name, u.phone, u.email, u.active,
        (SELECT COUNT(*) FROM clients WHERE seller_id = s.id) AS client_count,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE seller_id = s.id AND status = 'pending') AS pending_commission,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE seller_id = s.id AND status = 'paid') AS total_earned
      FROM sellers s
      JOIN users u ON u.id = s.user_id
      ORDER BY u.name ASC
    `),

  findById: (id: number) =>
    queryOne<any>(`
      SELECT s.*, u.name, u.phone, u.email
      FROM sellers s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `, [id]),

  findByQrCode: (qrCode: string) =>
    queryOne<any>(`
      SELECT s.*, u.name, u.phone, u.email
      FROM sellers s
      JOIN users u ON u.id = s.user_id
      WHERE s.qr_code = ? AND s.active = 1
    `, [qrCode]),

  findByUserId: (userId: number) =>
    queryOne<any>('SELECT * FROM sellers WHERE user_id = ?', [userId]),

  create: (data: { user_id: number; qr_code: string; qr_url: string; commission_type: string; commission_value: number }) =>
    execute('INSERT INTO sellers (user_id, qr_code, qr_url, commission_type, commission_value) VALUES (?, ?, ?, ?, ?)',
      [data.user_id, data.qr_code, data.qr_url, data.commission_type, data.commission_value]),

  update: (id: number, data: Partial<{ commission_type: string; commission_value: number; active: number; notes: string; device_token: string | null }>) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = [...Object.values(data), id]
  return execute(`UPDATE sellers SET ${fields} WHERE id = ?`, values)
},

updateUser: (sellerId: number, data: Partial<{ name: string; phone: string; email: string | null }>) => {
  const fields = Object.keys(data).map(k => `u.${k} = ?`).join(', ')
  const values = [...Object.values(data), sellerId]
  return execute(`UPDATE users u JOIN sellers s ON s.user_id = u.id SET ${fields} WHERE s.id = ?`, values)
},

  getStats: (sellerId: number) =>
    queryOne<any>(`
      SELECT
        (SELECT COUNT(*) FROM clients WHERE seller_id = ?) AS total_clients,
        (SELECT COUNT(*) FROM appointments WHERE seller_id = ?) AS total_appointments,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE seller_id = ? AND status = 'pending') AS pending_commission,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE seller_id = ? AND status = 'paid') AS total_earned,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE seller_id = ? AND status = 'paid'
          AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())) AS earned_this_month
    `, [sellerId, sellerId, sellerId, sellerId, sellerId]),
}

// ─── ROLES ────────────────────────────────────────────────────
export const roleQueries = {
  findAll: async () => {
    const roles = await query<any>('SELECT * FROM roles ORDER BY is_system DESC, name ASC')
    const perms = await query<any>('SELECT * FROM role_permissions ORDER BY role_id, module')
    return roles.map((r: any) => ({
      ...r,
      permissions: perms.filter((p: any) => p.role_id === r.id),
    }))
  },

  findById: async (id: number) => {
    const role = await queryOne<any>('SELECT * FROM roles WHERE id = ?', [id])
    if (!role) return null
    const permissions = await query<any>('SELECT * FROM role_permissions WHERE role_id = ?', [id])
    return { ...role, permissions }
  },

  create: (data: { name: string; description: string; color: string }) =>
    execute('INSERT INTO roles (name, description, color) VALUES (?, ?, ?)',
      [data.name, data.description, data.color]),

  update: (id: number, data: { name: string; description: string; color: string }) =>
    execute('UPDATE roles SET name = ?, description = ?, color = ? WHERE id = ?',
      [data.name, data.description, data.color, id]),

  delete: (id: number) =>
    execute('DELETE FROM roles WHERE id = ? AND is_system = 0', [id]),

  setPermissions: async (roleId: number, permissions: Array<{
    module: string; can_view: number; can_create: number; can_edit: number; can_delete: number
  }>) => {
    await execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId])
    for (const p of permissions) {
      await execute(
        'INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [roleId, p.module, p.can_view, p.can_create, p.can_edit, p.can_delete]
      )
    }
  },
}

// ─── CLIENTS ──────────────────────────────────────────────────
export const clientQueries = {
  findAll: () =>
    query<any>(`
      SELECT c.*, u.name AS seller_name,
        (SELECT COUNT(*) FROM appointments WHERE client_id = c.id) AS appointment_count,
        (SELECT MAX(preferred_date) FROM appointments WHERE client_id = c.id AND status = 'completed') AS last_service
      FROM clients c
      LEFT JOIN sellers s ON s.id = c.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY c.created_at DESC
    `),

  findById: (id: number) =>
    queryOne<any>(`
      SELECT c.*, u.name AS seller_name, s.id AS seller_id
      FROM clients c
      LEFT JOIN sellers s ON s.id = c.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE c.id = ?
    `, [id]),

  findByPhone: (phone: string) =>
    queryOne<any>('SELECT * FROM clients WHERE phone = ?', [phone]),

  findByEmail: (email: string) =>
    queryOne<any>('SELECT * FROM clients WHERE email = ?', [email]),

  findBySeller: (sellerId: number) =>
    query<any>(`
      SELECT c.*,
        (SELECT COUNT(*) FROM appointments WHERE client_id = c.id) AS appointment_count,
        (SELECT COALESCE(SUM(amount),0) FROM commissions WHERE client_id = c.id AND seller_id = ?) AS commission_earned
      FROM clients c
      WHERE c.seller_id = ?
      ORDER BY c.created_at DESC
    `, [sellerId, sellerId]),

  create: (data: { name: string; phone: string; email?: string; seller_id?: number; notes?: string }) =>
    execute('INSERT INTO clients (name, phone, email, seller_id, notes) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.phone, data.email || null, data.seller_id || null, data.notes || null]),

  updateSeller: (clientId: number, sellerId: number | null) =>
    execute('UPDATE clients SET seller_id = ? WHERE id = ?', [sellerId, clientId]),

  update: (id: number, data: Partial<{ name: string; phone: string; email: string; seller_id: number; notes: string }>) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(data), id]
    return execute(`UPDATE clients SET ${fields} WHERE id = ?`, values)
  },
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
export const appointmentQueries = {
  findAll: (filters?: { status?: string; date?: string }) => {
    let sql = `
      SELECT a.*, c.name AS client_name, c.phone AS client_phone,
        u.name AS seller_name, s.id AS seller_id,
        cu.name AS confirmed_by_name
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      LEFT JOIN sellers s ON s.id = a.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN users cu ON cu.id = a.confirmed_by
      WHERE 1=1
    `
    const values: unknown[] = []
    if (filters?.status) { sql += ' AND a.status = ?'; values.push(filters.status) }
    if (filters?.date)   { sql += ' AND a.preferred_date = ?'; values.push(filters.date) }
    sql += ' ORDER BY a.preferred_date ASC, a.created_at DESC'
    return query<any>(sql, values)
  },

  findById: (id: number) =>
    queryOne<any>(`
      SELECT a.*, c.name AS client_name, c.phone AS client_phone,
        u.name AS seller_name, s.id AS seller_id
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      LEFT JOIN sellers s ON s.id = a.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE a.id = ?
    `, [id]),

  findByDate: (date: string) =>
    query<any>(`
      SELECT a.*, c.name AS client_name, c.phone AS client_phone,
        u.name AS seller_name
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      LEFT JOIN sellers s ON s.id = a.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE a.preferred_date = ?
      ORDER BY a.created_at ASC
    `, [date]),

  countByDate: (date: string) =>
    queryOne<any>('SELECT COUNT(*) AS count FROM appointments WHERE preferred_date = ? AND status != "cancelled"', [date]),

  create: (data: {
    client_id: number; seller_id?: number; service: string;
    vehicle_make?: string; vehicle_color?: string; vin?: string;
    preferred_date?: string; notes?: string
  }) =>
    execute(
      `INSERT INTO appointments (client_id, seller_id, service, vehicle_make, vehicle_color, vin, preferred_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.client_id, data.seller_id || null, data.service,
       data.vehicle_make || null, data.vehicle_color || null,
       data.vin || null,
       data.preferred_date || null, data.notes || null]
    ),

  updateStatus: (id: number, status: string, confirmedBy?: number) =>
    execute(`UPDATE appointments SET status = ?, confirmed_by = ?, confirmed_at = NOW() WHERE id = ?`,
      [status, confirmedBy || null, id]),

  getTodayStats: () =>
    queryOne<any>(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE preferred_date = CURDATE() AND status != 'cancelled') AS today_total,
        (SELECT COUNT(*) FROM appointments WHERE preferred_date = CURDATE() AND status = 'confirmed') AS today_confirmed,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') AS total_pending,
        4 - (SELECT COUNT(*) FROM appointments WHERE preferred_date = CURDATE() AND status != 'cancelled') AS today_slots_free
    `),
}

// ─── INVOICES ─────────────────────────────────────────────────
export const invoiceQueries = {
  findAll: (filters?: { status?: string; client_id?: number }) => {
    let sql = `
      SELECT i.*, c.name AS client_name, c.phone AS client_phone,
        u.name AS paid_by_name,
        su.name AS seller_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      LEFT JOIN users u ON u.id = i.paid_by
      LEFT JOIN sellers s ON s.id = c.seller_id
      LEFT JOIN users su ON su.id = s.user_id
      WHERE 1=1
    `
    const values: unknown[] = []
    if (filters?.status)    { sql += ' AND i.status = ?';    values.push(filters.status) }
    if (filters?.client_id) { sql += ' AND i.client_id = ?'; values.push(filters.client_id) }
    sql += ' ORDER BY i.created_at DESC'
    return query<any>(sql, values)
  },

  findById: (id: number) =>
    queryOne<any>(`
      SELECT i.*, c.name AS client_name,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'id', ii.id, 'description', ii.description,
          'quantity', ii.quantity, 'unit_price', ii.unit_price, 'total', ii.total
        )) FROM invoice_items ii WHERE ii.invoice_id = i.id) AS items
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE i.id = ?
    `, [id]),

  getNextNumber: async () => {
    const row = await queryOne<any>('SELECT MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)) AS last FROM invoices')
    const next = (row?.last || 0) + 1
    return `AWX-${String(next).padStart(4, '0')}`
  },

  create: (data: {
    invoice_number: string; client_id: number; appointment_id?: number;
    subtotal: number; tax: number; total: number; payment_method: string; notes?: string
  }) =>
    execute(`INSERT INTO invoices (invoice_number, client_id, appointment_id, subtotal, tax, total, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.invoice_number, data.client_id, data.appointment_id || null,
       data.subtotal, data.tax, data.total, data.payment_method, data.notes || null]),

  markPaid: (id: number, paidBy: number) =>
    execute("UPDATE invoices SET status = 'paid', paid_at = NOW(), paid_by = ? WHERE id = ?", [paidBy, id]),

  getMonthStats: () =>
    queryOne<any>(`
      SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN total ELSE 0 END), 0) AS month_revenue,
        COUNT(*) AS month_invoices,
        COALESCE(AVG(CASE WHEN status='paid' THEN total ELSE NULL END), 0) AS avg_ticket,
        COALESCE(SUM(CASE WHEN status='pending' THEN total ELSE 0 END), 0) AS pending_revenue
      FROM invoices
      WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
    `),
}

// ─── COMMISSIONS ──────────────────────────────────────────────
export const commissionQueries = {
  findAll: (filters?: { seller_id?: number; status?: string }) => {
    let sql = `
      SELECT co.*, u.name AS seller_name, c.name AS client_name,
        i.invoice_number, i.payment_method
      FROM commissions co
      JOIN sellers s ON s.id = co.seller_id
      JOIN users u ON u.id = s.user_id
      JOIN clients c ON c.id = co.client_id
      JOIN invoices i ON i.id = co.invoice_id
      WHERE 1=1
    `
    const values: unknown[] = []
    if (filters?.seller_id) { sql += ' AND co.seller_id = ?'; values.push(filters.seller_id) }
    if (filters?.status)    { sql += ' AND co.status = ?';    values.push(filters.status) }
    sql += ' ORDER BY co.created_at DESC'
    return query<any>(sql, values)
  },

  findBySeller: (sellerId: number, status?: string) => {
    let sql = `
      SELECT co.*, c.name AS client_name, i.invoice_number, i.paid_at AS service_date
      FROM commissions co
      JOIN clients c ON c.id = co.client_id
      JOIN invoices i ON i.id = co.invoice_id
      WHERE co.seller_id = ?
    `
    const values: unknown[] = [sellerId]
    if (status) { sql += ' AND co.status = ?'; values.push(status) }
    sql += ' ORDER BY co.created_at DESC'
    return query<any>(sql, values)
  },

  create: (data: {
    seller_id: number; invoice_id: number; client_id: number;
    service: string; invoice_total: number;
    commission_type: string; commission_rate: number; amount: number
  }) =>
    execute(`INSERT INTO commissions
      (seller_id, invoice_id, client_id, service, invoice_total, commission_type, commission_rate, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.seller_id, data.invoice_id, data.client_id, data.service,
       data.invoice_total, data.commission_type, data.commission_rate, data.amount]),

  markPaid: (ids: number[], paymentId: number) =>
    execute(`UPDATE commissions SET status = 'paid', payment_id = ? WHERE id IN (${ids.map(() => '?').join(',')})`,
      [paymentId, ...ids]),

  createPayment: (data: { seller_id: number; total: number; paid_by: number; method: string; notes?: string }) =>
    execute('INSERT INTO commission_payments (seller_id, total, paid_by, method, notes) VALUES (?, ?, ?, ?, ?)',
      [data.seller_id, data.total, data.paid_by, data.method, data.notes || null]),

  getPendingBySeller: () =>
    query<any>(`
      SELECT co.seller_id, u.name AS seller_name, u.phone AS seller_phone,
        COUNT(*) AS commission_count,
        SUM(co.amount) AS total_pending
      FROM commissions co
      JOIN sellers s ON s.id = co.seller_id
      JOIN users u ON u.id = s.user_id
      WHERE co.status = 'pending'
      GROUP BY co.seller_id, u.name, u.phone
      ORDER BY total_pending DESC
    `),

  calculateForInvoice: async (invoiceId: number, sellerId: number, invoiceTotal: number, service: string) => {
    const seller = await queryOne<any>('SELECT commission_type, commission_value FROM sellers WHERE id = ?', [sellerId])
    if (!seller) return null
    const amount = seller.commission_type === 'percent'
      ? (invoiceTotal * seller.commission_value / 100)
      : seller.commission_value
    return { commission_type: seller.commission_type, commission_rate: seller.commission_value, amount }
  },
}
