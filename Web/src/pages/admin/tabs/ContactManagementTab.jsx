import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Clock, User, Phone, Search, Check, AlertCircle, X, Plus, Edit, Trash2, Calendar, FileText, Download } from 'lucide-react';
import { dataService } from '../../../services/data/dataService';

export default function ContactManagementTab({ toast }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'Pending', 'Replied'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedContact, setSelectedContact] = useState(null); // For Email Reply
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingContactId, setEditingContactId] = useState(null);

  // Add/Edit Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState('Pending');
  const [formReplyText, setFormReplyText] = useState('');

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    setSelectedIds([]); // Clear selection when list is reloaded
    try {
      const res = await dataService.getContacts();
      if (res.success) {
        setContacts(res.data);
      } else {
        toast.error("Lỗi", res.message || "Không thể tải danh sách liên hệ.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenReply = (contact) => {
    setSelectedContact(contact);
    setReplySubject(`[EstateAI] Phản hồi yêu cầu: ${contact.subject}`);
    setReplyText('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await dataService.replyContactRequest(selectedContact.id, replyText, replySubject);
      if (res.success) {
        toast.success("Thành công", "Đã gửi email phản hồi cho khách hàng.");
        setSelectedContact(null);
        fetchContacts();
      } else {
        toast.error("Lỗi", res.message || "Không thể gửi phản hồi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Lỗi kết nối khi gửi phản hồi.");
    } finally {
      setSendingReply(false);
    }
  };

  // Add/Edit handler
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingContactId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSubject('');
    setFormMessage('');
    setFormStatus('Pending');
    setFormReplyText('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
    setModalMode('edit');
    setEditingContactId(contact.id);
    setFormName(contact.name || '');
    setFormEmail(contact.email || '');
    setFormPhone(contact.phone || '');
    setFormSubject(contact.subject || '');
    setFormMessage(contact.message || '');
    setFormStatus(contact.status || 'Pending');
    setFormReplyText(contact.replyText || '');
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone || !formSubject || !formMessage) {
      toast.error("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      subject: formSubject,
      message: formMessage,
      status: formStatus,
      replyText: formStatus === 'Replied' ? formReplyText : null
    };

    try {
      if (modalMode === 'add') {
        const res = await dataService.addContactRequest(payload);
        if (res.success) {
          toast.success("Thành công", "Thêm khách hàng liên hệ thành công.");
          setIsAddEditModalOpen(false);
          fetchContacts();
        } else {
          toast.error("Lỗi", res.message || "Không thể thêm liên hệ.");
        }
      } else {
        const res = await dataService.updateContactRequest(editingContactId, payload);
        if (res.success) {
          toast.success("Thành công", "Cập nhật thông tin thành công.");
          setIsAddEditModalOpen(false);
          fetchContacts();
        } else {
          toast.error("Lỗi", res.message || "Không thể cập nhật.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Lỗi kết nối khi gửi yêu cầu.");
    }
  };

  // Delete Confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, contactId: null, contactName: '' });

  // Delete handler
  const handleDeleteContact = (id, name) => {
    setDeleteConfirm({
      isOpen: true,
      contactId: id,
      contactName: name
    });
  };

  const executeDeleteContact = async () => {
    try {
      const res = await dataService.deleteContactRequest(deleteConfirm.contactId);
      if (res.success) {
        toast.success("Thành công", "Đã xóa yêu cầu liên hệ.");
        fetchContacts();
      } else {
        toast.error("Lỗi", res.message || "Không thể xóa liên hệ.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Lỗi kết nối khi xóa liên hệ.");
    } finally {
      setDeleteConfirm({ isOpen: false, contactId: null, contactName: '' });
    }
  };

  // Selection handlers
  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const executeBulkDelete = async () => {
    try {
      const res = await dataService.bulkDeleteContactRequests(selectedIds);
      if (res.success) {
        toast.success("Thành công", `Đã xóa thành công ${selectedIds.length} liên hệ.`);
        fetchContacts();
      } else {
        toast.error("Lỗi", res.message || "Không thể xóa hàng loạt.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi", "Lỗi kết nối khi xóa hàng loạt.");
    } finally {
      setIsBulkDeleteOpen(false);
    }
  };

  // Export to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    if (filteredContacts.length === 0) {
      toast.error("Thông báo", "Không có dữ liệu khách hàng nào để xuất.");
      return;
    }

    const headers = ["Họ và tên", "Số điện thoại", "Email", "Chủ đề yêu cầu", "Nội dung lời nhắn", "Trạng thái", "Nội dung phản hồi", "Thời gian nhận"];

    const csvRows = [
      headers.join(","),
      ...filteredContacts.map(c => {
        const row = [
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${(c.phone || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${(c.subject || '').replace(/"/g, '""')}"`,
          `"${(c.message || '').replace(/"/g, '""')}"`,
          `"${c.status === 'Replied' ? 'Đã trả lời' : 'Chưa trả lời'}"`,
          `"${(c.replyText || '').replace(/"/g, '""')}"`,
          `"${formatDate(c.createdAt)}"`
        ];
        return row.join(",");
      })
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_lien_he_khach_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Thành công", `Đã xuất dữ liệu ${filteredContacts.length} liên hệ khách hàng.`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.status === filter;
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ animation: 'fadeInScale 0.3s ease-out' }}>

      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản lý ý kiến & liên hệ</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Quản lý, thêm, sửa, xóa thông tin liên hệ và gửi email phản hồi trực tiếp cho khách hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              style={{
                border: 'none',
                background: '#fee2e2',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
            >
              <Trash2 size={17} /> Xóa hàng loạt ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleExportExcel}
            style={{
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            <Download size={17} /> Xuất Excel
          </button>
          <button
            onClick={handleOpenAddModal}
            style={{
              border: 'none',
              background: 'linear-gradient(135deg, #0f766e, #0891b2)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)'
            }}
          >
            <Plus size={18} /> Thêm liên hệ
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'white', padding: '1.25rem', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
          <button
            onClick={() => setFilter('all')}
            style={{ border: 'none', background: filter === 'all' ? 'white' : 'transparent', color: filter === 'all' ? '#0f766e' : '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('Pending')}
            style={{ border: 'none', background: filter === 'Pending' ? 'white' : 'transparent', color: filter === 'Pending' ? '#b45309' : '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', boxShadow: filter === 'Pending' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
          >
            Chưa trả lời
          </button>
          <button
            onClick={() => setFilter('Replied')}
            style={{ border: 'none', background: filter === 'Replied' ? 'white' : 'transparent', color: filter === 'Replied' ? '#0f766e' : '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', boxShadow: filter === 'Replied' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
          >
            Đã trả lời
          </button>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.5rem', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}
          />
        </div>
      </div>

      {/* Main List view table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: '0 0 0.5rem' }}>Không tìm thấy liên hệ nào</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Hệ thống chưa nhận được thông tin liên hệ nào trùng khớp.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '1rem 1.5rem', width: '50px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0} 
                      onChange={handleSelectAll} 
                      style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle' }} 
                    />
                  </th>
                  <th style={{ padding: '1rem 1.5rem' }}>Khách hàng</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Nội dung yêu cầu</th>
                  <th style={{ padding: '1rem 1.5rem', width: '140px' }}>Trạng thái</th>
                  <th style={{ padding: '1rem 1.5rem', width: '170px' }}>Thời gian nhận</th>
                  <th style={{ padding: '1rem 1.5rem', width: '150px', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', background: selectedIds.includes(contact.id) ? '#f0fdfa' : 'transparent' }} className="table-row-hover">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(contact.id)} 
                        onChange={() => handleSelectRow(contact.id)} 
                        style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle' }} 
                      />
                    </td>
                    {/* Customer Info */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{contact.name}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {contact.phone}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {contact.email}
                        </span>
                      </div>
                    </td>
                    {/* Subject & Message */}
                    <td style={{ padding: '1rem 1.5rem', maxWidth: '350px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>{contact.subject}</span>
                        <p style={{ margin: 0, color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={contact.message}>
                          "{contact.message}"
                        </p>
                        {contact.status === 'Replied' && contact.replyText && (
                          <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginTop: '0.2rem', padding: '4px 8px', background: '#f0fdfa', borderRadius: 6, display: 'inline-block' }}>
                            <strong>Phản hồi:</strong> {contact.replyText}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Status Badge */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {contact.status === 'Replied' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', background: '#d8f3ef', padding: '0.25rem 0.55rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          <Check size={12} /> Đã trả lời
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '0.25rem 0.55rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          <AlertCircle size={12} /> Chờ trả lời
                        </span>
                      )}
                    </td>
                    {/* Time */}
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <Calendar size={13} /> {formatDate(contact.createdAt)}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.55rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {contact.status === 'Pending' && (
                          <button
                            onClick={() => handleOpenReply(contact)}
                            title="Phản hồi Email"
                            style={{ border: 'none', background: '#d8f3ef', color: '#0f766e', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(contact)}
                          title="Sửa thông tin"
                          style={{ border: 'none', background: '#f1f5f9', color: '#475569', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          title="Xóa liên hệ"
                          style={{ border: 'none', background: '#fee2e2', color: '#ef4444', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedContact && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div
            style={{ background: 'white', width: 620, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Soạn phản hồi gửi khách hàng</h3>
                <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Gửi thư tới: {selectedContact.name} &lt;{selectedContact.email}&gt;</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendReply} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Original Query details */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Yêu cầu gốc của khách hàng:</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4, whiteSpace: 'pre-line' }}>"{selectedContact.message}"</p>
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Tiêu đề Email:</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              {/* Content text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Nội dung trả lời:</label>
                <textarea
                  placeholder="Nhập câu trả lời chi tiết cho khách hàng ở đây..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  rows={6}
                  style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #0f766e, #0891b2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                  }}
                >
                  <Send size={15} />
                  {sendingReply ? 'Đang gửi Email...' : 'Gửi phản hồi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isAddEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div
            style={{ background: 'white', width: 550, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                {modalMode === 'add' ? 'Thêm mới khách hàng liên hệ' : 'Chỉnh sửa thông tin liên hệ'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddEditSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Họ và tên *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Số điện thoại *</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Địa chỉ email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Chủ đề cần tư vấn *</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Nội dung lời nhắn *</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  required
                  rows={4}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Trạng thái xử lý</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                >
                  <option value="Pending">Chờ trả lời (Pending)</option>
                  <option value="Replied">Đã trả lời (Replied)</option>
                </select>
              </div>

              {/* Reply Text (optional) */}
              {formStatus === 'Replied' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Nội dung đã phản hồi</label>
                  <textarea
                    value={formReplyText}
                    onChange={(e) => setFormReplyText(e.target.value)}
                    placeholder="Nhập nội dung đã trả lời khách hàng..."
                    rows={3}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #0f766e, #0891b2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                  }}
                >
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div
            style={{ background: 'white', width: 420, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Trash2 size={28} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Xác nhận xóa</h3>

              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa yêu cầu liên hệ của <strong style={{ color: '#0f172a' }}>"{deleteConfirm.contactName}"</strong> không?
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, contactId: null, contactName: '' })}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={executeDeleteContact}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div 
            style={{ background: 'white', width: 420, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Trash2 size={28} />
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Xác nhận xóa hàng loạt</h3>
              
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa <strong style={{ color: '#ef4444' }}>{selectedIds.length}</strong> yêu cầu liên hệ đã chọn không? Hành động này không thể hoàn tác.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={executeBulkDelete}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Row Hover effects */}
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

    </div>
  );
}
