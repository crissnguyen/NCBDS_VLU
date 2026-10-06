import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Clock, User, Phone, Search, Check, AlertCircle, X, Plus, Edit, Trash2, Calendar, FileText, Download, MoreVertical } from 'lucide-react';
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
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.contact-action-dropdown-wrapper')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

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
    <>
      <div className="admin-table-card admin-filter-table-card contact-list-card">
        {/* Unified Table Header Toolbar */}
      <div className="admin-table-header-toolbar">
        <div className="admin-table-header-left">
          <div className="admin-table-header-icon">
            <MessageSquare size={20} />
          </div>
          <div className="admin-table-header-info">
            <div className="admin-table-header-title-row">
              <h2 className="admin-table-header-title">Quản lý liên hệ</h2>
              <span className="admin-table-count-badge">{filteredContacts.length} liên hệ</span>
            </div>
            <p className="admin-table-header-subtitle">Tiếp nhận và xử lý yêu cầu tư vấn từ khách hàng</p>
          </div>
        </div>

        <div className="admin-table-header-right admin-table-actions">
          {/* Export Excel Button */}
          <button 
            className="admin-table-btn-secondary"
            onClick={handleExportExcel}
          >
            <Download size={15} /> Xuất Excel
          </button>

          {/* Bulk Delete */}
          {selectedIds.length > 0 && (
            <button 
              className="admin-table-btn-danger"
              onClick={() => setIsBulkDeleteOpen(true)}
            >
              <Trash2 size={14} /> Xóa ({selectedIds.length})
            </button>
          )}

          {/* Add Contact Button */}
          <button 
            className="admin-table-btn-primary"
            onClick={handleOpenAddModal}
          >
            <Plus size={15} /> Thêm liên hệ
          </button>
        </div>
      </div>
      <div className="admin-table-filters">
        <div className="admin-table-search-input">
            <Search size={15} color="#667085" />
            <input 
              type="text" 
              aria-label="Tìm kiếm"
              placeholder="Tìm tên, email, SĐT..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
            {searchQuery && (
              <button aria-label="Xóa tìm kiếm" onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98a2b3', fontSize: '0.8rem', padding: 0 }}>✕</button>
            )}
          </div>
        <select 
            className="admin-table-select"
            aria-label="Trạng thái liên hệ"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ trả lời</option>
            <option value="Replied">Đã trả lời</option>
          </select>
      </div>

      {/* Main List view table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'white' }}>
          <MessageSquare size={36} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, color: '#101828' }}>Không tìm thấy liên hệ nào</div>
          <div style={{ fontSize: '0.8rem', color: '#667085', marginTop: 2 }}>Hệ thống chưa nhận được thông tin liên hệ nào trùng khớp.</div>
        </div>
      ) : (
        <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-unified-table">
            <thead>
              <tr>
                <th style={{ width: '46px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0} 
                    onChange={handleSelectAll} 
                    style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle', accentColor: '#0f766e' }} 
                  />
                </th>
                <th>Khách hàng</th>
                <th>Nội dung yêu cầu</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '150px' }}>Thời gian nhận</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, idx) => (
                <tr key={contact.id} style={{ background: selectedIds.includes(contact.id) ? '#f0fdfa' : 'transparent' }} className="table-row-hover">
                  <td style={{ textAlign: 'center', width: '46px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(contact.id)} 
                      onChange={() => handleSelectRow(contact.id)} 
                      style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle', accentColor: '#0f766e' }} 
                    />
                  </td>
                    {/* Customer Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{contact.name}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {contact.phone}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {contact.email}
                        </span>
                      </div>
                    </td>
                    {/* Subject & Message */}
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e' }}>{contact.subject}</span>
                        <p style={{ margin: 0, color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '0.8rem' }} title={contact.message}>
                          "{contact.message}"
                        </p>
                        {contact.status === 'Replied' && contact.replyText && (
                          <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic', marginTop: '0.2rem', padding: '3px 7px', background: '#f0fdfa', borderRadius: 6, display: 'inline-block' }}>
                            <strong>Phản hồi:</strong> {contact.replyText}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Status Badge */}
                    <td style={{ textAlign: 'center' }}>
                      {contact.status === 'Replied' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.74rem', fontWeight: 600, color: '#027a48', background: '#ecfdf5', border: '1px solid #a6f4c5', padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          <Check size={12} /> Đã trả lời
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.74rem', fontWeight: 600, color: '#b54708', background: '#fffaeb', border: '1px solid #fedf89', padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          <AlertCircle size={12} /> Chờ trả lời
                        </span>
                      )}
                    </td>
                    {/* Time */}
                    <td style={{ color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <Calendar size={13} /> {formatDate(contact.createdAt)}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <div className="contact-action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', textAlign: 'left' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === contact.id ? null : contact.id);
                          }}
                          title="Hành động"
                          aria-label="Hành động"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: '1px solid #d0d5dd',
                            background: openActionId === contact.id ? '#f1f5f9' : 'white',
                            color: openActionId === contact.id ? '#0f766e' : '#475467',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                          }}
                          onMouseEnter={e => { if (openActionId !== contact.id) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { if (openActionId !== contact.id) e.currentTarget.style.background = 'white'; }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openActionId === contact.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              ...(idx >= filteredContacts.length - 2 && filteredContacts.length > 3
                                ? { bottom: '100%', marginBottom: 6 }
                                : { top: '100%', marginTop: 6 }),
                              width: 175,
                              background: '#ffffff',
                              border: '1px solid #eaecf0',
                              borderRadius: 10,
                              boxShadow: '0 12px 24px -4px rgba(16, 24, 40, 0.14), 0 4px 6px -2px rgba(16, 24, 40, 0.05)',
                              padding: '4px',
                              zIndex: 100
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {contact.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenReply(contact);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: 6,
                                  color: '#0f766e',
                                  fontSize: '0.82rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.12s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdfa'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <Send size={14} color="#0f766e" />
                                <span>Phản hồi Email</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                handleOpenEditModal(contact);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 6,
                                color: '#344054',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f2f4f7'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Edit size={14} color="#175cd3" />
                              <span>Sửa thông tin</span>
                            </button>

                            <div style={{ height: 1, background: '#f2f4f7', margin: '4px 0' }} />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                handleDeleteContact(contact.id, contact.name);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 6,
                                color: '#d92d20',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef3f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={14} color="#d92d20" />
                              <span>Xóa liên hệ</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedContact && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div
            style={{ background: 'white', width: 620, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dark-surface" style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Soạn phản hồi gửi khách hàng</h3>
                <p style={{ margin: '0.2rem 0 0', color: '#e2f3f1', fontSize: '0.78rem' }}>Gửi thư tới: {selectedContact.name} &lt;{selectedContact.email}&gt;</p>
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
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>Yêu cầu gốc của khách hàng:</div>
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
            <div className="dark-surface" style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
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

    </>
  );
}
