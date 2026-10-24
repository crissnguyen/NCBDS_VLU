import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Clock, User, Phone, Search, Check, AlertCircle, X, Plus, Edit, Trash2, Calendar, FileText, Download, MoreVertical, UserCheck, Eye } from 'lucide-react';
import { dataService } from '../../../services/data/dataService';
import { getCurrentUser } from '../../../services/api';

export default function ContactManagementTab({ toast, currentUser }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'Pending', 'Replied'
  const [searchQuery, setSearchQuery] = useState('');

  const activeUser = currentUser || getCurrentUser();

  // Modals state
  const [selectedContact, setSelectedContact] = useState(null); // For Email Reply
  const [detailContact, setDetailContact] = useState(null); // For View Details Modal
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
  const [formRepliedBy, setFormRepliedBy] = useState('');
  const [formRepliedByEmail, setFormRepliedByEmail] = useState('');

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
      const senderName = activeUser?.name || 'Ban quản trị EstateAI';
      const senderEmail = activeUser?.email || '';
      const res = await dataService.replyContactRequest(
        selectedContact.id, 
        replyText, 
        replySubject,
        senderName,
        senderEmail
      );
      if (res.success) {
        toast.success("Thành công", `Đã gửi email phản hồi từ tài khoản ${senderEmail || senderName}.`);
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
    setFormRepliedBy(activeUser?.name || 'Ban quản trị');
    setFormRepliedByEmail(activeUser?.email || '');
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
    setFormRepliedBy(contact.repliedBy || activeUser?.name || 'Ban quản trị');
    setFormRepliedByEmail(contact.repliedByEmail || activeUser?.email || '');
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
      replyText: formStatus === 'Replied' ? formReplyText : null,
      repliedBy: formStatus === 'Replied' ? formRepliedBy : null,
      repliedByEmail: formStatus === 'Replied' ? formRepliedByEmail : null
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

    const headers = [
      "Họ và tên", 
      "Số điện thoại", 
      "Email", 
      "Chủ đề yêu cầu", 
      "Nội dung lời nhắn", 
      "Trạng thái", 
      "Nội dung phản hồi", 
      "Người phản hồi", 
      "Email phản hồi", 
      "Thời gian phản hồi", 
      "Thời gian nhận"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredContacts.map(c => {
        const row = [
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${(c.phone || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${(c.subject || '').replace(/"/g, '""')}"`,
          `"${(c.message || '').replace(/"/g, '""')}"`,
          `"${c.status === 'Replied' ? 'Đã trả lời' : 'Chờ trả lời'}"`,
          `"${(c.replyText || '').replace(/"/g, '""')}"`,
          `"${(c.repliedBy || '').replace(/"/g, '""')}"`,
          `"${(c.repliedByEmail || '').replace(/"/g, '""')}"`,
          `"${c.repliedAt ? formatDate(c.repliedAt) : ''}"`,
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
          <div style={{ fontWeight: 'var(--font-weight-subheading)', color: '#101828' }}>Không tìm thấy liên hệ nào</div>
          <div style={{ fontSize: '0.8rem', color: '#667085', marginTop: 2 }}>Hệ thống chưa nhận được thông tin liên hệ nào trùng khớp.</div>
        </div>
      ) : (
        <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-unified-table">
            <thead>
              <tr>
                <th style={{ width: '44px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0} 
                    onChange={handleSelectAll} 
                    style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle', accentColor: '#0f766e' }} 
                  />
                </th>
                <th style={{ width: '200px' }}>Khách hàng</th>
                <th style={{ minWidth: '220px', maxWidth: '300px' }}>Yêu cầu của khách</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ minWidth: '240px', maxWidth: '320px' }}>Xử lý / Người phản hồi</th>
                <th style={{ width: '135px' }}>Thời gian nhận</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, idx) => (
                <tr key={contact.id} style={{ background: selectedIds.includes(contact.id) ? '#f0fdfa' : 'transparent' }} className="table-row-hover">
                  <td style={{ textAlign: 'center', width: '44px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(contact.id)} 
                      onChange={() => handleSelectRow(contact.id)} 
                      style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle', accentColor: '#0f766e' }} 
                    />
                  </td>

                  {/* Customer Info */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        color: '#0f766e',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {contact.name?.charAt(0)?.toUpperCase() || 'K'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.name}
                        </strong>
                        <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} /> {contact.phone}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contact.email}>
                          <Mail size={11} /> {contact.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Request / Query */}
                  <td style={{ verticalAlign: 'middle', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f766e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contact.subject}>
                        {contact.subject}
                      </span>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' }} title={contact.message}>
                        "{contact.message}"
                      </p>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {contact.status === 'Replied' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600, color: '#027a48', background: '#ecfdf5', border: '1px solid #a6f4c5', padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                        <Check size={12} /> Đã trả lời
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600, color: '#b54708', background: '#fffaeb', border: '1px solid #fedf89', padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                        <Clock size={12} /> Chờ trả lời
                      </span>
                    )}
                  </td>

                  {/* Processing / Replier Info */}
                  <td style={{ verticalAlign: 'middle', maxWidth: '320px' }}>
                    {contact.status === 'Replied' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}>
                          <UserCheck size={12} color="#0f766e" />
                          <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {contact.repliedBy || 'Ban quản trị'}
                          </strong>
                          {contact.repliedByEmail && (
                            <span style={{ color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              ({contact.repliedByEmail})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contact.replyText}>
                          <span style={{ color: '#0f766e', fontWeight: 600 }}>Nội dung:</span> {contact.replyText}
                        </div>
                        {contact.repliedAt && (
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {formatDate(contact.repliedAt)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReply(contact)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: 7,
                          border: '1px solid #0f766e',
                          background: '#f0fdfa',
                          color: '#0f766e',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0f766e'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0f766e'; }}
                      >
                        <Send size={12} /> Trả lời ngay
                      </button>
                    )}
                  </td>

                  {/* Time */}
                  <td style={{ color: '#64748b', verticalAlign: 'middle' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <Calendar size={13} color="#94a3b8" /> {formatDate(contact.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', position: 'relative' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setDetailContact(contact)}
                        title="Xem chi tiết yêu cầu"
                        aria-label="Xem chi tiết"
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: '1px solid #d0d5dd',
                          background: 'white',
                          color: '#475467',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0f766e'; e.currentTarget.style.borderColor = '#99f6e4'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475467'; e.currentTarget.style.borderColor = '#d0d5dd'; }}
                      >
                        <Eye size={15} />
                      </button>

                      <div className="contact-action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', textAlign: 'left' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === contact.id ? null : contact.id);
                          }}
                          title="Hành động khác"
                          aria-label="Hành động khác"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: '1px solid #d0d5dd',
                            background: openActionId === contact.id ? '#f1f5f9' : 'white',
                            color: openActionId === contact.id ? '#0f766e' : '#475467',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <MoreVertical size={15} />
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
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                setDetailContact(contact);
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
                                fontWeight: 'var(--font-weight-button)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f2f4f7'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Eye size={14} color="#0f766e" />
                              <span>Xem chi tiết</span>
                            </button>

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
                                  fontWeight: 'var(--font-weight-button)',
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
                                fontWeight: 'var(--font-weight-button)',
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
                                fontWeight: 'var(--font-weight-button)',
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Detail Contact Modal */}
      {detailContact && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}
          onClick={() => setDetailContact(null)}
        >
          <div
            style={{ background: 'white', width: 680, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dark-surface" style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>Chi tiết yêu cầu liên hệ</h3>
                  <p style={{ margin: '0.15rem 0 0', color: '#ccfbf1', fontSize: '0.76rem' }}>Nhận lúc: {formatDate(detailContact.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailContact(null)}
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Card 1: Khách hàng */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Thông tin khách hàng</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{detailContact.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: 6, fontSize: '0.82rem', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} color="#0f766e" /> {detailContact.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={13} color="#0f766e" /> {detailContact.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>Trạng thái xử lý</div>
                  {detailContact.status === 'Replied' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#027a48', background: '#ecfdf5', border: '1px solid #a6f4c5', padding: '4px 10px', borderRadius: 999 }}>
                      <Check size={13} /> Đã trả lời email
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#b54708', background: '#fffaeb', border: '1px solid #fedf89', padding: '4px 10px', borderRadius: 999 }}>
                      <Clock size={13} /> Chờ phản hồi
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Nội dung yêu cầu */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.4rem' }}>Chủ đề yêu cầu</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f766e', marginBottom: '0.75rem' }}>{detailContact.subject}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.4rem' }}>Lời nhắn của khách</div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line', border: '1px solid #f1f5f9' }}>
                  "{detailContact.message}"
                </div>
              </div>

              {/* Card 3: Phản hồi */}
              <div style={{ border: '1px solid #ccfbf1', background: '#f0fdfa', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <UserCheck size={14} /> Thông tin phản hồi
                  </div>
                  {detailContact.repliedAt && (
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>🕒 {formatDate(detailContact.repliedAt)}</span>
                  )}
                </div>

                {detailContact.status === 'Replied' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                      <span style={{ color: '#64748b' }}>Người phản hồi:</span>
                      <strong style={{ color: '#0f172a' }}>{detailContact.repliedBy || 'Ban quản trị EstateAI'}</strong>
                      {detailContact.repliedByEmail && (
                        <span style={{ color: '#0369a1', background: '#e0f2fe', padding: '1px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
                          {detailContact.repliedByEmail}
                        </span>
                      )}
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: '0.88rem', color: '#1f2937', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {detailContact.replyText}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Yêu cầu này chưa được gửi câu trả lời qua email.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const c = detailContact;
                        setDetailContact(null);
                        handleOpenReply(c);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#0f766e',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.5rem 1rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={14} /> Trả lời ngay
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const c = detailContact;
                    setDetailContact(null);
                    handleOpenEditModal(c);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Edit size={14} color="#175cd3" /> Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = detailContact.id;
                    const name = detailContact.name;
                    setDetailContact(null);
                    handleDeleteContact(id, name);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Trash2 size={14} color="#be123c" /> Xóa
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {detailContact.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = detailContact;
                      setDetailContact(null);
                      handleOpenReply(c);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0f766e, #0891b2)', color: 'white', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Send size={14} /> Gửi email phản hồi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailContact(null)}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Đóng
                </button>
              </div>
            </div>

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
            <div className="dark-surface" style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'var(--font-weight-subheading)', color: '#ffffff' }}>Soạn phản hồi gửi khách hàng</h3>
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

              {/* Account / Responder sending the reply */}
              <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.75rem 1rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tài khoản đang gửi phản hồi:</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {activeUser?.name || 'Quản trị viên'}
                      {activeUser?.email && (
                        <span style={{ fontWeight: 400, color: '#0f766e', marginLeft: '6px' }}>
                          &lt;{activeUser.email}&gt;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#027a48', border: '1px solid #a6f4c5', padding: '2px 8px', borderRadius: 999, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Đang hoạt động
                </span>
              </div>

              {/* Original Query details */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b', marginBottom: '0.35rem' }}>Yêu cầu gốc của khách hàng:</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4, whiteSpace: 'pre-line' }}>"{selectedContact.message}"</p>
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Tiêu đề Email:</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Nội dung trả lời:</label>
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
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer' }}
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
                    fontWeight: 'var(--font-weight-button)',
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'var(--font-weight-subheading)', color: '#ffffff' }}>
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
                  <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Họ và tên *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Số điện thoại *</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Địa chỉ email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Chủ đề cần tư vấn *</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Nội dung lời nhắn *</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Trạng thái xử lý</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                >
                  <option value="Pending">Chờ trả lời (Pending)</option>
                  <option value="Replied">Đã trả lời (Replied)</option>
                </select>
              </div>

              {/* Reply Details (when status is Replied) */}
              {formStatus === 'Replied' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Người phản hồi</label>
                      <input
                        type="text"
                        value={formRepliedBy}
                        onChange={(e) => setFormRepliedBy(e.target.value)}
                        placeholder="Tên nhân viên / Quản trị viên"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Email tài khoản phản hồi</label>
                      <input
                        type="email"
                        value={formRepliedByEmail}
                        onChange={(e) => setFormRepliedByEmail(e.target.value)}
                        placeholder="email@estateai.com"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-subheading)', color: '#64748b' }}>Nội dung đã phản hồi</label>
                    <textarea
                      value={formReplyText}
                      onChange={(e) => setFormReplyText(e.target.value)}
                      placeholder="Nhập nội dung đã trả lời khách hàng..."
                      rows={3}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer' }}
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
                    fontWeight: 'var(--font-weight-button)',
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

              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 'var(--font-weight-subheading)', color: '#0f172a' }}>Xác nhận xóa</h3>

              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa yêu cầu liên hệ của <strong style={{ color: '#0f172a' }}>"{deleteConfirm.contactName}"</strong> không?
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, contactId: null, contactName: '' })}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer', transition: 'all 0.2s' }}
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
                    fontWeight: 'var(--font-weight-button)',
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
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 'var(--font-weight-subheading)', color: '#0f172a' }}>Xác nhận xóa hàng loạt</h3>
              
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa <strong style={{ color: '#ef4444' }}>{selectedIds.length}</strong> yêu cầu liên hệ đã chọn không? Hành động này không thể hoàn tác.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer', transition: 'all 0.2s' }}
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
                    fontWeight: 'var(--font-weight-button)',
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
