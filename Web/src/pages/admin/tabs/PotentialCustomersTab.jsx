import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { dataService } from '../../../services/data/dataService';

export default function PotentialCustomersTab({ toast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, vip_buyer, vip_renter, high_visitor, hot_lead
  const [statusFilter, setStatusFilter] = useState('all'); // all, hot, consulting, viewing, closed, nurturing
  const [sortBy, setSortBy] = useState('score_desc'); // score_desc, visits_desc, purchases_desc, rentals_desc, date_desc

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingLeadId, setEditingLeadId] = useState(null);

  // Detail Profile Modal
  const [viewingLead, setViewingLead] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'vip_buyer',
    totalPurchases: 0,
    totalRentals: 0,
    totalVisits: 0,
    budget: '',
    preferredType: '',
    preferredLocation: '',
    assignedSale: 'Nguyễn Duy Đức',
    status: 'consulting',
    notes: ''
  });

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.lead-action-dropdown-wrapper')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await dataService.getLeads();
      if (res.success) {
        setLeads(res.data || []);
      } else {
        toast?.error('Lỗi', res.message || 'Không thể tải danh sách khách hàng.');
      }
    } catch {
      toast?.error('Lỗi', 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Compute AI Lead Score
  const calculateScore = (lead) => {
    let score = 50;
    // Purchases: 8 pts each (max 24)
    score += Math.min(24, (Number(lead.totalPurchases) || 0) * 8);
    // Rentals: 5 pts each (max 15)
    score += Math.min(15, (Number(lead.totalRentals) || 0) * 5);
    // Visits: 1 pt per 10 visits (max 15)
    score += Math.min(15, Math.floor((Number(lead.totalVisits) || 0) / 10));
    // Status bonus
    if (lead.status === 'hot') score += 10;
    if (lead.status === 'viewing') score += 8;
    if (lead.status === 'consulting') score += 5;
    if (lead.type === 'vip_buyer') score += 6;
    return Math.min(99, Math.max(40, score));
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = leads.length;
    const vipBuyers = leads.filter(l => l.type === 'vip_buyer' || l.totalPurchases >= 2).length;
    const vipRenters = leads.filter(l => l.type === 'vip_renter' || l.totalRentals >= 2).length;
    const highVisitors = leads.filter(l => l.type === 'high_visitor' || l.totalVisits >= 80).length;
    const hotLeads = leads.filter(l => l.status === 'hot').length;
    return { total, vipBuyers, vipRenters, highVisitors, hotLeads };
  }, [leads]);

  // Filtered & Sorted list
  const filteredLeads = useMemo(() => {
    let list = leads.filter(lead => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        lead.name?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.preferredLocation?.toLowerCase().includes(query) ||
        lead.preferredType?.toLowerCase().includes(query);

      const matchType = typeFilter === 'all' || lead.type === typeFilter;
      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'score_desc') return (b.leadScore || calculateScore(b)) - (a.leadScore || calculateScore(a));
      if (sortBy === 'visits_desc') return (b.totalVisits || 0) - (a.totalVisits || 0);
      if (sortBy === 'purchases_desc') return (b.totalPurchases || 0) - (a.totalPurchases || 0);
      if (sortBy === 'rentals_desc') return (b.totalRentals || 0) - (a.totalRentals || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [leads, searchQuery, typeFilter, statusFilter, sortBy]);

  useEffect(() => { setCurrentPage(1); setOpenActionId(null); }, [searchQuery, typeFilter, statusFilter, sortBy, pageSize]);
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageStart = (activePage - 1) * pageSize;
  const visibleLeads = filteredLeads.slice(pageStart, pageStart + pageSize);

  // Form Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingLeadId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      type: 'vip_buyer',
      totalPurchases: 0,
      totalRentals: 0,
      totalVisits: 0,
      budget: '',
      preferredType: '',
      preferredLocation: '',
      assignedSale: 'Nguyễn Duy Đức',
      status: 'consulting',
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setModalMode('edit');
    setEditingLeadId(lead.id);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      type: lead.type || 'vip_buyer',
      totalPurchases: lead.totalPurchases || 0,
      totalRentals: lead.totalRentals || 0,
      totalVisits: lead.totalVisits || 0,
      budget: lead.budget || '',
      preferredType: lead.preferredType || '',
      preferredLocation: lead.preferredLocation || '',
      assignedSale: lead.assignedSale || 'Nguyễn Duy Đức',
      status: lead.status || 'consulting',
      notes: lead.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast?.error('Lỗi', 'Vui lòng nhập tên và số điện thoại khách hàng.');
      return;
    }

    const payload = {
      ...formData,
      totalPurchases: Number(formData.totalPurchases) || 0,
      totalRentals: Number(formData.totalRentals) || 0,
      totalVisits: Number(formData.totalVisits) || 0,
      leadScore: calculateScore(formData),
      lastActive: 'Vừa cập nhật'
    };

    try {
      if (modalMode === 'add') {
        const res = await dataService.createLead(payload);
        if (res.success) {
          toast?.success('Thành công', 'Đã thêm khách hàng tiềm năng mới.');
          setIsAddEditModalOpen(false);
          fetchLeads();
        }
      } else {
        const res = await dataService.updateLead(editingLeadId, payload);
        if (res.success) {
          toast?.success('Thành công', 'Đã cập nhật thông tin khách hàng.');
          setIsAddEditModalOpen(false);
          fetchLeads();
        }
      }
    } catch {
      toast?.error('Lỗi', 'Không thể lưu thông tin khách hàng.');
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) return;
    try {
      await dataService.deleteLead(id);
      toast?.success('Thành công', 'Đã xóa khách hàng khỏi danh sách.');
      fetchLeads();
    } catch {
      toast?.error('Lỗi', 'Không thể xóa khách hàng.');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await dataService.bulkDeleteLeads(selectedIds);
      toast?.success('Thành công', `Đã xóa ${selectedIds.length} khách hàng.`);
      setIsBulkDeleteOpen(false);
      setSelectedIds([]);
      fetchLeads();
    } catch {
      toast?.error('Lỗi', 'Không thể xóa hàng loạt.');
    }
  };

  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await dataService.updateLead(leadId, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast?.success('Cập nhật', 'Đã đổi trạng thái chăm sóc.');
    } catch {
      toast?.error('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  const handleExportExcel = () => {
    if (!filteredLeads.length) {
      toast?.warning('Trống', 'Không có dữ liệu để xuất Excel.');
      return;
    }
    const rows = filteredLeads.map(l => ({
      'Họ và tên': l.name,
      'Số điện thoại': l.phone,
      'Email': l.email,
      'Phân loại': typeLabels[l.type] || l.type,
      'Số lần mua': l.totalPurchases || 0,
      'Số lần thuê': l.totalRentals || 0,
      'Số lượt truy cập': l.totalVisits || 0,
      'Điểm tiềm năng (AI)': l.leadScore || calculateScore(l),
      'Ngân sách': l.budget,
      'Khu vực quan tâm': l.preferredLocation,
      'Loại BĐS': l.preferredType,
      'Trạng thái': statusLabels[l.status] || l.status,
      'Sale phụ trách': l.assignedSale,
      'Ghi chú': l.notes
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KhachHangTiemNang');
    XLSX.writeFile(wb, `DanhSach_KhachHang_TiemNang_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast?.success('Thành công', 'Đã tải xuống file Excel.');
  };

  // Types & Status Definitions
  const typeLabels = {
    vip_buyer: 'Khách mua nhiều',
    vip_renter: 'Khách thuê nhiều',
    high_visitor: 'Truy cập nhiều',
    hot_lead: 'Khách tiềm năng'
  };

  const typeDots = {
    vip_buyer: '#0f766e',
    vip_renter: '#2563eb',
    high_visitor: '#f59e0b',
    hot_lead: '#ef4444'
  };

  const statusLabels = {
    hot: 'Nóng (Cần liên hệ)',
    consulting: 'Đang tư vấn',
    viewing: 'Hẹn xem nhà',
    closed: 'Đã chốt deal',
    nurturing: 'Chăm sóc định kỳ'
  };

  const statusColors = {
    hot: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    consulting: { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' },
    viewing: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
    closed: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    nurturing: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
  };

  return (
    <div className="potential-customers-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
             Khách hàng tiềm năng & VIP
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
            Quản lý khách mua/thuê nhiều, người dùng tương tác cao và chấm điểm tiềm năng bằng AI.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            onClick={handleExportExcel}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
              padding: '0.55rem 0.9rem', borderRadius: 10, border: '1px solid #e2e8f0', 
              background: 'white', color: '#334155', fontWeight: 600, fontSize: '0.82rem', 
              cursor: 'pointer', transition: 'all 0.15s ease' 
            }}
          >
             Xuất Excel
          </button>

          <button 
            onClick={handleOpenAddModal}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
              padding: '0.55rem 1.05rem', borderRadius: 10, border: 'none', 
              background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: 'white', 
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(15,118,110,0.25)' 
            }}
          >
             Thêm khách hàng
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Cards (Enterprise & Minimalist) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Tổng khách tiềm năng */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Tổng khách theo dõi</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{metrics.total}</div>
          </div>
        </div>

        {/* Card 2: Khách mua nhiều (VIP Buyers) */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Khách mua nhiều (VIP)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{metrics.vipBuyers}</div>
          </div>
        </div>

        {/* Card 3: Khách thuê nhiều (VIP Renters) */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Khách thuê nhiều</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{metrics.vipRenters}</div>
          </div>
        </div>

        {/* Card 4: Khách truy cập nhiều (Top Visitors) */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Truy cập nhiều (&gt;80 lượt)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{metrics.highVisitors}</div>
          </div>
        </div>

      </div>

      {/* 3. Main Data Card with Filter Toolbar */}
      <div style={{ marginTop: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        
        {/* Filter Navigation Row */}
        <div className="lead-filter-panel">
          
          {/* Search and Secondary Selects */}
          <div className="lead-filter-row">
            
            {/* Search Input */}
            <div className="lead-filter-search">
              
              <input 
                type="text"
                aria-label="Tìm kiếm khách hàng" 
                placeholder="Tìm theo tên, điện thoại, email, khu vực..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              aria-label="Nhóm khách hàng"
              value={typeFilter}
              onChange={event => setTypeFilter(event.target.value)}
            >
              <option value="all">Tất cả khách hàng</option>
              <option value="vip_buyer">Mua nhiều (VIP)</option>
              <option value="vip_renter">Thuê nhiều</option>
              <option value="high_visitor">Truy cập nhiều</option>
              <option value="hot_lead">Cần liên hệ ngay</option>
            </select>

            {/* Status Filter */}
            <select 
              aria-label="Trạng thái khách hàng"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="hot"> Nóng (Cần liên hệ)</option>
              <option value="consulting">Đang tư vấn</option>
              <option value="viewing">Hẹn xem nhà</option>
              <option value="closed">Đã chốt deal</option>
              <option value="nurturing">Chăm sóc định kỳ</option>
            </select>

            {/* Sort Filter */}
            <select 
              aria-label="Sắp xếp khách hàng"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="score_desc">Điểm AI cao nhất</option>
              <option value="visits_desc">Lượt truy cập nhiều nhất</option>
              <option value="purchases_desc">Mua nhiều nhất</option>
              <option value="rentals_desc">Thuê nhiều nhất</option>
              <option value="date_desc">Mới nhất</option>
            </select>

            {/* Bulk Action Trigger */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.5rem 0.85rem', borderRadius: 9, border: '1px solid #fecdd3',
                  background: '#fff1f2', color: '#be123c', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                 Xóa ({selectedIds.length})
              </button>
            )}

          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>

                <th style={{ padding: '0.85rem 1rem' }}>Khách hàng</th>
                <th style={{ padding: '0.85rem 1rem' }}>Phân loại</th>
                <th style={{ padding: '0.85rem 1rem' }}>Hoạt động &amp; Lịch sử</th>
                <th style={{ padding: '0.85rem 1rem' }}>Nhu cầu &amp; Ngân sách</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Điểm AI</th>
                <th style={{ padding: '0.85rem 1rem' }}>Trạng thái</th>
                <th style={{ padding: '0.85rem 1rem' }}>Sale phụ trách</th>
                <th style={{ width: 90, padding: '0.85rem 1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Đang tải dữ liệu khách hàng tiềm năng...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Không tìm thấy khách hàng phù hợp.
                  </td>
                </tr>
              ) : (
                visibleLeads.map((lead, idx) => {
                  const score = lead.leadScore || calculateScore(lead);
                  const isSelected = selectedIds.includes(lead.id);

                  return (
                    <tr 
                      key={lead.id}
                      style={{ 
                        borderBottom: idx < visibleLeads.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: isSelected ? '#f8fafc' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Customer Info */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ 
                            width: 34, height: 34, borderRadius: '50%', 
                            background: '#f1f5f9', border: '1px solid #e2e8f0', 
                            color: '#0f2a44', fontWeight: 800, fontSize: '0.85rem', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                          }}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div 
                              onClick={() => setViewingLead(lead)}
                              style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#0f766e'}
                              onMouseLeave={e => e.currentTarget.style.color = '#0f172a'}
                            >
                              {lead.name}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: 1 }}>{lead.phone} · {lead.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                          padding: 0, border: 'none', whiteSpace: 'nowrap', 
                          background: 'transparent', color: '#1e293b', fontSize: '0.75rem', fontWeight: 600,
                          boxShadow: 'none'
                        }}>
                          <span style={{ width: 6, height: 6, flexShrink: 0, borderRadius: '50%', background: typeDots[lead.type] || '#64748b' }} />
                          {typeLabels[lead.type] || lead.type}
                        </span>
                      </td>

                      {/* Activity & History */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.76rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#0f766e', fontWeight: 700 }}>Mua: {lead.totalPurchases || 0}</span>
                            <span style={{ color: '#cbd5e1' }}>|</span>
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>Thuê: {lead.totalRentals || 0}</span>
                          </div>
                          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                             <strong>{lead.totalVisits || 0}</strong> lượt truy cập
                          </div>
                        </div>
                      </td>

                      {/* Need & Budget */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontSize: '0.78rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.budget || 'Chưa rõ'}</div>
                          <div style={{ color: '#64748b', fontSize: '0.73rem', marginTop: 1 }}>
                            {lead.preferredType || 'Tất cả loại hình'} · {lead.preferredLocation || 'Toàn quốc'}
                          </div>
                        </div>
                      </td>

                      {/* AI Lead Score */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ 
                            fontWeight: 800, fontSize: '0.82rem', 
                            color: score >= 85 ? '#0f766e' : score >= 70 ? '#2563eb' : '#d97706' 
                          }}>
                            {score}/100
                          </span>
                          <div style={{ width: 44, height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${score}%`, height: '100%', 
                              background: score >= 85 ? '#0f766e' : score >= 70 ? '#2563eb' : '#d97706',
                              borderRadius: 99 
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select 
                          aria-label={`Trạng thái của ${lead.name}`}
                          className="lead-status-select"
                          value={lead.status}
                          onChange={e => handleQuickStatusChange(lead.id, e.target.value)}
                          style={{
                            padding: '3px 0', borderRadius: 0,
                            fontSize: '0.74rem', fontWeight: 600,
                            border: 'none',
                            background: 'transparent',
                            color: statusColors[lead.status]?.text || '#475569',
                            outline: 'none', cursor: 'pointer'
                          }}
                        >
                          <option value="hot"> Nóng</option>
                          <option value="consulting">Đang tư vấn</option>
                          <option value="viewing">Hẹn xem nhà</option>
                          <option value="closed">Đã chốt</option>
                          <option value="nurturing">Chăm sóc</option>
                        </select>
                      </td>

                      {/* Assigned Sale */}
                      <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.78rem' }}>
                        {lead.assignedSale || 'Chưa gán'}
                      </td>

                      {/* Action Dropdown Menu */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', position: 'relative' }}>
                        <div className="lead-action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
                          <button 
                            type="button"
                            aria-label={`Thao tác với ${lead.name}`}
                            aria-expanded={openActionId === lead.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === lead.id ? null : lead.id);
                            }}
                            style={{ 
                              padding: '0 8px', height: 28, borderRadius: 6, fontSize: '0.72rem', gap: 5, whiteSpace: 'nowrap', 
                              border: '1px solid #e2e8f0', background: 'white', 
                              color: '#64748b', display: 'inline-flex', alignItems: 'center', 
                              justifyContent: 'center', cursor: 'pointer' 
                            }}
                          >
                            Thao tác <ChevronDown size={13} aria-hidden="true" style={{ flexShrink: 0, transform: openActionId === lead.id ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                          </button>

                          {openActionId === lead.id && (
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', marginTop: 4,
                              background: 'white', borderRadius: 10, border: '1px solid #e2e8f0',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 150,
                              padding: '4px', display: 'flex', flexDirection: 'column', gap: 2
                            }}>
                              <button
                                onClick={() => { setViewingLead(lead); setOpenActionId(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.5rem 0.65rem', border: 'none', background: 'none',
                                  fontSize: '0.78rem', color: '#1e293b', fontWeight: 600,
                                  borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >
                                 Xem hồ sơ
                              </button>

                              <button
                                onClick={() => { handleOpenEditModal(lead); setOpenActionId(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.5rem 0.65rem', border: 'none', background: 'none',
                                  fontSize: '0.78rem', color: '#1e293b', fontWeight: 600,
                                  borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >
                                 Chỉnh sửa
                              </button>

                              <a
                                href={`tel:${lead.phone}`}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.5rem 0.65rem', textDecoration: 'none',
                                  fontSize: '0.78rem', color: '#1e293b', fontWeight: 600,
                                  borderRadius: 6, textAlign: 'left'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >
                                 Gọi điện
                              </a>

                              <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />

                              <button
                                onClick={() => { handleDeleteLead(lead.id, lead.name); setOpenActionId(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.5rem 0.65rem', border: 'none', background: 'none',
                                  fontSize: '0.78rem', color: '#ef4444', fontWeight: 600,
                                  borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >
                                 Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="property-management-pagination compact-pagination">
          <div className="property-management-pagination-summary">
            <strong>{filteredLeads.length ? pageStart + 1 : 0}–{Math.min(pageStart + pageSize, filteredLeads.length)}</strong> / {filteredLeads.length} khách hàng
          </div>
          <div className="compact-pagination-controls">
            <label className="property-management-page-size compact-page-size">
              <select aria-label="Số khách hàng mỗi trang" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                {[10, 20, 50].map(size => <option key={size} value={size}>{size} / trang</option>)}
              </select>
            </label>
            <nav className="compact-pagination-pages" aria-label="Phân trang khách hàng">
              <button title="Trang trước" aria-label="Trang trước" disabled={activePage === 1} onClick={() => { setCurrentPage(activePage - 1); setOpenActionId(null); }}><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - activePage) <= 1)
                .flatMap((page, index, pages) => [
                  ...(index > 0 && page - pages[index - 1] > 1 ? [<span key={`gap-${page}`} className="compact-pagination-gap">…</span>] : []),
                  <button key={page} aria-label={`Trang ${page}`} aria-current={activePage === page ? 'page' : undefined} onClick={() => { setCurrentPage(page); setOpenActionId(null); }}>{page}</button>
                ])}
              <button title="Trang sau" aria-label="Trang sau" disabled={activePage === totalPages} onClick={() => { setCurrentPage(activePage + 1); setOpenActionId(null); }}><ChevronRight size={16} /></button>
            </nav>
          </div>
        </div>

      </div>

      {/* 4. Modal: Thêm / Sửa khách hàng */}
      {isAddEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: 18, width: 600, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {modalMode === 'add' ? 'Thêm khách hàng tiềm năng' : 'Chỉnh sửa thông tin khách hàng'}
              </h3>
              <button type="button" aria-label="Đóng hộp thoại" onClick={() => setIsAddEditModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Tên khách hàng *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Số điện thoại *</label>
                  <input 
                    type="text" required
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912 345 678"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Email</label>
                  <input 
                    type="email"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Phân loại khách hàng</label>
                  <select
                    value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="vip_buyer"> Khách mua nhiều (VIP Buyer)</option>
                    <option value="vip_renter"> Khách thuê nhiều (VIP Renter)</option>
                    <option value="high_visitor"> Khách truy cập nhiều (High Visitor)</option>
                    <option value="hot_lead"> Khách tiềm năng (Hot Lead)</option>
                  </select>
                </div>
              </div>

              {/* Behavior & Transactions */}
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: 3 }}>Đã mua (BĐS)</label>
                  <input 
                    type="number" min={0}
                    value={formData.totalPurchases} onChange={e => setFormData({ ...formData, totalPurchases: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: 3 }}>Đã thuê (BĐS)</label>
                  <input 
                    type="number" min={0}
                    value={formData.totalRentals} onChange={e => setFormData({ ...formData, totalRentals: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: 3 }}>Số lượt truy cập</label>
                  <input 
                    type="number" min={0}
                    value={formData.totalVisits} onChange={e => setFormData({ ...formData, totalVisits: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Ngân sách dự kiến</label>
                  <input 
                    type="text"
                    value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Ví dụ: 15 - 25 tỷ, hoặc 30 tr/tháng"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Khu vực quan tâm</label>
                  <input 
                    type="text"
                    value={formData.preferredLocation} onChange={e => setFormData({ ...formData, preferredLocation: e.target.value })}
                    placeholder="Nha Trang, TP.HCM, Hà Nội..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Loại BĐS quan tâm</label>
                  <input 
                    type="text"
                    value={formData.preferredType} onChange={e => setFormData({ ...formData, preferredType: e.target.value })}
                    placeholder="Biệt thự, Shophouse, Đất nền..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Trạng thái chăm sóc</label>
                  <select
                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="hot"> Nóng (Cần liên hệ)</option>
                    <option value="consulting">Đang tư vấn</option>
                    <option value="viewing">Hẹn xem nhà</option>
                    <option value="closed">Đã chốt deal</option>
                    <option value="nurturing">Chăm sóc định kỳ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Ghi chú hành vi / nhu cầu đặc thù</label>
                <textarea 
                  rows={3}
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú chi tiết về nhu cầu, sở thích hoặc lưu ý khi tiếp cận khách hàng..."
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" onClick={() => setIsAddEditModalOpen(false)}
                  style={{ padding: '0.6rem 1.15rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.6rem 1.35rem', borderRadius: 8, border: 'none', background: '#0f766e', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {modalMode === 'add' ? 'Thêm khách hàng' : 'Lưu thay đổi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Xem hồ sơ khách hàng (Profile Card) */}
      {viewingLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: 20, width: 550, maxWidth: '92vw', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f766e', color: 'white', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {viewingLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewingLead.name}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>{viewingLead.phone} · {viewingLead.email}</div>
                </div>
              </div>

              <button type="button" aria-label="Đóng hồ sơ khách hàng" onClick={() => setViewingLead(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Profile Metrics Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Đã mua</small>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#0f766e' }}>{viewingLead.totalPurchases || 0} BĐS</strong>
              </div>
              <div>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Đã thuê</small>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#2563eb' }}>{viewingLead.totalRentals || 0} BĐS</strong>
              </div>
              <div>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Lượt truy cập</small>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#d97706' }}>{viewingLead.totalVisits || 0} lượt</strong>
              </div>
            </div>

            {/* Detail info list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Phân loại:</span>
                <strong>{typeLabels[viewingLead.type] || viewingLead.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Ngân sách:</span>
                <strong style={{ color: '#0f766e' }}>{viewingLead.budget || 'Chưa cung cấp'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Khu vực quan tâm:</span>
                <span>{viewingLead.preferredLocation || 'Chưa cung cấp'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Loại BĐS ưu tiên:</span>
                <span>{viewingLead.preferredType || 'Chưa cung cấp'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Điểm tiềm năng (AI):</span>
                <strong style={{ color: '#0f766e' }}>{viewingLead.leadScore || calculateScore(viewingLead)}/100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Sale phụ trách:</span>
                <span>{viewingLead.assignedSale || 'Chưa gán'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Hoạt động gần nhất:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{viewingLead.lastActive || 'Gần đây'}</span>
              </div>
            </div>

            {/* AI Note Box */}
            <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                 Ghi chú chăm sóc &amp; Đề xuất AI
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#134e4a', lineHeight: 1.5 }}>
                {viewingLead.notes || 'Khách hàng có lịch sử tương tác tích cực. Khuyên Sale chủ động liên hệ gửi danh sách các BĐS mới trong khu vực quan tâm.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a 
                href={`tel:${viewingLead.phone}`}
                style={{ flex: 1, padding: '0.65rem', borderRadius: 9, background: '#0f766e', color: 'white', fontWeight: 700, fontSize: '0.84rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                 Gọi điện ngay
              </a>
              <button 
                onClick={() => {
                  const leadToEdit = viewingLead;
                  setViewingLead(null);
                  handleOpenEditModal(leadToEdit);
                }}
                style={{ flex: 1, padding: '0.65rem', borderRadius: 9, background: 'white', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                 Chỉnh sửa hồ sơ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Modal Xóa hàng loạt */}
      {isBulkDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 800 }}>Xác nhận xóa hàng loạt?</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa <strong>{selectedIds.length}</strong> khách hàng đã chọn? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsBulkDeleteOpen(false)} style={{ padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Hủy bỏ</button>
              <button onClick={handleBulkDelete} style={{ padding: '0.55rem 1.15rem', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
