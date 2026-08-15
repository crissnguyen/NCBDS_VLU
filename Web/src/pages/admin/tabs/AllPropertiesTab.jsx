import { useState, useEffect, useMemo } from 'react';
import { Trash2, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, Building2, Edit3, SlidersHorizontal } from 'lucide-react';
import { mediaUrl } from '../../../services/api';
import { dataService } from '../../../services/data/dataService';

export default function AllPropertiesTab({ allProperties = [], setEditingProperty, handleDeleteProperty, handleApproveProperty, fetchData, toast }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');

  // Pagination state (default 10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawList = Array.isArray(allProperties) ? allProperties : [];

  // Filter properties dynamically
  const filteredProperties = useMemo(() => {
    return rawList.filter(p => {
      const matchSearch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.author?.name || 'Admin').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchTransaction = transactionFilter === 'all' || p.transactionType === transactionFilter;
      const matchPropertyType = propertyTypeFilter === 'all' || p.propertyType === propertyTypeFilter;

      return matchSearch && matchStatus && matchTransaction && matchPropertyType;
    });
  }, [rawList, searchTerm, statusFilter, transactionFilter, propertyTypeFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, statusFilter, transactionFilter, propertyTypeFilter, pageSize]);

  const totalPages = Math.ceil(filteredProperties.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProperties.length);
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentProperties.length && currentProperties.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentProperties.map(p => p.id));
    }
  };

  const executeBulkDelete = async () => {
    try {
      const res = await dataService.bulkDeleteProperties(selectedIds);
      if (res.success) {
        toast?.success('Thành công', `Đã xóa ${selectedIds.length} tin.`);
        if (fetchData) fetchData();
        setSelectedIds([]);
      } else {
        toast?.error('Thất bại', res.message || 'Lỗi xóa hàng loạt.');
      }
    } catch (err) {
      toast?.error('Lỗi', 'Không thể kết nối máy chủ.');
    } finally {
      setIsBulkDeleteOpen(false);
    }
  };

  const getPropertyTypeName = (type) => {
    switch (type) {
      case 'apartment': return 'Căn hộ';
      case 'house': return 'Nhà phố';
      case 'villa': return 'Biệt thự';
      case 'land': return 'Đất nền';
      case 'shophouse': return 'Shophouse';
      default: return type || 'BĐS';
    }
  };

  return (
    <div className="property-management-card" style={{ background: 'white', borderRadius: 16, border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.08)', overflow: 'hidden' }}>
      {/* 1. Unified Table Card Top Toolbar Header */}
      <div style={{ 
        padding: '1rem 1.25rem', 
        borderBottom: '1px solid #eaecf0', 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'space-between',
        background: '#ffffff',
        flexWrap: 'nowrap',
        gap: '1rem'
      }}>
        {/* Title & Count Badge */}
        <div className="property-management-heading" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', whiteSpace: 'nowrap' }}>
          <div className="property-management-heading-icon"><Building2 size={20} /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#101828', letterSpacing: '-0.01em' }}>
              Tất cả tin đăng
            </h2>
            <p className="property-management-subtitle">Theo dõi và quản lý toàn bộ tin bất động sản</p>
          </div>
          <span className="property-management-count" style={{ 
            background: '#f0fdf4', 
            color: '#15803d', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            padding: '2px 8px', 
            borderRadius: 16,
            border: '1px solid #bbf7d0'
          }}>
            {filteredProperties.length} tin
          </span>
        </div>

        {/* Right Search & Filter Actions (Strict Single Row) */}
        <div className="property-management-tools" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {/* Search Box */}
          <div className="property-management-search" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            background: '#ffffff', 
            padding: '0.45rem 0.85rem', 
            borderRadius: 8, 
            border: '1px solid #d0d5dd', 
            width: 260,
            height: 38,
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
          }}>
            <Search size={15} color="#667085" />
            <input
              type="text"
              placeholder="Tìm theo tên tin đăng, vị trí, môi giới..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: '#101828' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98a2b3', fontSize: '0.8rem', padding: 0 }}>✕</button>
            )}
          </div>

          {/* Category Filter 1: Hình thức (Bán / Cho thuê) */}
          <select 
            className="property-management-status-select"
            value={transactionFilter}
            onChange={e => setTransactionFilter(e.target.value)}
            style={{ 
              height: 36,
              padding: '0 0.75rem', 
              borderRadius: 8, 
              border: '1px solid #d0d5dd', 
              background: '#ffffff', 
              fontSize: '0.82rem', 
              color: '#344054', 
              fontWeight: 600, 
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          >
            <option value="all">Tất cả hình thức</option>
            <option value="sale">Bán</option>
            <option value="rent">Cho thuê</option>
          </select>

          {/* Category Filter 2: Loại BĐS */}
          <select 
            className="property-management-status-select"
            value={propertyTypeFilter}
            onChange={e => setPropertyTypeFilter(e.target.value)}
            style={{ 
              height: 36,
              padding: '0 0.75rem', 
              borderRadius: 8, 
              border: '1px solid #d0d5dd', 
              background: '#ffffff', 
              fontSize: '0.82rem', 
              color: '#344054', 
              fontWeight: 600, 
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          >
            <option value="all">Tất cả loại BĐS</option>
            <option value="apartment">Căn hộ</option>
            <option value="house">Nhà phố</option>
            <option value="villa">Biệt thự</option>
            <option value="land">Đất nền</option>
            <option value="shophouse">Shophouse</option>
          </select>

          {/* Status Dropdown Filter */}
          <label className="property-management-filter-label"><SlidersHorizontal size={15} /> <span>Lọc</span></label>
          <select className="property-management-status-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ 
              height: 36,
              padding: '0 0.75rem', 
              borderRadius: 8, 
              border: '1px solid #d0d5dd', 
              background: '#ffffff', 
              fontSize: '0.82rem', 
              color: '#344054', 
              fontWeight: 600, 
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>

          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              style={{ 
                height: 36,
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                background: '#fef2f2', 
                color: '#b91c1c', 
                border: '1px solid #fda4af', 
                padding: '0 0.85rem', 
                borderRadius: 8, 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={14} /> Xóa ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Data Table */}
      {filteredProperties.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#475467', fontSize: '0.875rem' }}>
          <Building2 size={36} color="#d0d5dd" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, color: '#101828' }}>Không tìm thấy tin đăng nào</div>
          <div style={{ fontSize: '0.8rem', color: '#667085', marginTop: 2 }}>Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc trạng thái.</div>
        </div>
      ) : (
        <div>
          {/* Scrollable Container with Sticky Table Header */}
          <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto', overflowX: 'auto' }}>
            <table className="property-management-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475467', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #eaecf0' }}>
                  <th style={{ padding: '0.75rem 1.25rem', width: '44px', background: '#f8fafc' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === currentProperties.length && currentProperties.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', accentColor: '#0f766e', width: 16, height: 16 }}
                    />
                  </th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, background: '#f8fafc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bất động sản</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, background: '#f8fafc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phân loại</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, background: '#f8fafc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Môi giới</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, background: '#f8fafc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, background: '#f8fafc', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentProperties.map((p, idx) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isApproved = p.status === 'Approved';
                  const isPending = p.status === 'Pending';

                  return (
                    <tr 
                      key={p.id} 
                      style={{ 
                        borderBottom: '1px solid #f2f4f7', 
                        background: isSelected ? '#f0fdfa' : (idx % 2 === 0 ? '#ffffff' : '#fcfcfd'),
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfcfd'; }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', width: '44px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          style={{ cursor: 'pointer', accentColor: '#0f766e', width: 16, height: 16 }}
                        />
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                          <img 
                            src={p.images && p.images[0] ? mediaUrl(p.images[0]) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                            alt="" 
                            style={{ width: 56, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#101828', fontSize: '0.875rem', marginBottom: 2 }}>{p.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#667085' }}>
                              <strong style={{ color: '#0f766e', fontWeight: 700 }}>{p.price}</strong> • {p.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ 
                            display: 'inline-flex',
                            width: 'fit-content',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontWeight: 600, 
                            fontSize: '0.75rem',
                            background: p.transactionType === 'sale' ? '#eff8ff' : '#f9f5ff',
                            color: p.transactionType === 'sale' ? '#175cd3' : '#6941c6'
                          }}>
                            {p.transactionType === 'sale' ? 'Bán' : 'Cho thuê'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#667085' }}>{getPropertyTypeName(p.propertyType)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
                            {(p.author?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#344054', fontSize: '0.85rem' }}>{p.author?.name || 'Admin System'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px', 
                          borderRadius: 16, 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: isApproved ? '#ecfdf5' : isPending ? '#fffaeb' : '#fef2f2',
                          color: isApproved ? '#027a48' : isPending ? '#b54708' : '#b42318',
                          border: isApproved ? '1px solid #abedd8' : isPending ? '1px solid #fedf89' : '1px solid #fecdd3'
                        }}>
                          {isApproved && <CheckCircle2 size={12} />}
                          {isPending && <Clock size={12} />}
                          {!isApproved && !isPending && <XCircle size={12} />}
                          {isApproved ? 'Đã duyệt' : isPending ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button 
                            onClick={() => setEditingProperty(p)} 
                            style={{ 
                              padding: '5px 10px', 
                              background: '#ffffff', 
                              color: '#175cd3', 
                              border: '1px solid #d0d5dd', 
                              borderRadius: 6, 
                              fontWeight: 600, 
                              fontSize: '0.78rem', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                            }}
                          >
                            <Edit3 size={13} /> Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(p.id)} 
                            style={{ 
                              padding: '5px 10px', 
                              background: '#ffffff', 
                              color: '#b42318', 
                              border: '1px solid #fda4af', 
                              borderRadius: 6, 
                              fontWeight: 600, 
                              fontSize: '0.78rem', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                            }}
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. Integrated Footer Pagination Bar (Strict Single Line) */}
          <div className="property-management-pagination" style={{ 
            padding: '0.85rem 1.25rem', 
            background: '#ffffff', 
            borderTop: '1px solid #eaecf0', 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'space-between', 
            fontSize: '0.85rem', 
            color: '#475467',
            whiteSpace: 'nowrap'
          }}>
            {/* Left Info Summary */}
            <div className="property-management-pagination-summary">
              <span className="pagination-label">Đang hiển thị</span> <strong style={{ color: '#101828' }}>{filteredProperties.length > 0 ? startIndex + 1 : 0}–{endIndex}</strong> <span className="pagination-label">trên tổng số</span> <strong style={{ color: '#101828' }}>{filteredProperties.length}</strong> <span className="pagination-label">tin đăng</span>
            </div>

            {/* Right Controls Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', whiteSpace: 'nowrap' }}>
              {/* Items Per Page Dropdown */}
              <div className="property-management-page-size" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#667085' }}>Mỗi trang</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ 
                    height: 32,
                    padding: '0 0.6rem', 
                    borderRadius: 6, 
                    border: '1px solid #d0d5dd', 
                    background: '#ffffff', 
                    fontSize: '0.8rem', 
                    color: '#344054', 
                    fontWeight: 600, 
                    outline: 'none', 
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                  }}
                >
                  <option value={10}>10 tin / trang</option>
                  <option value={15}>15 tin / trang</option>
                  <option value={20}>20 tin / trang</option>
                  <option value={50}>50 tin / trang</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ 
                    height: 32,
                    padding: '0 0.75rem', 
                    borderRadius: 6, 
                    border: '1px solid #d0d5dd', 
                    background: currentPage === 1 ? '#f8fafc' : '#ffffff', 
                    color: currentPage === 1 ? '#d0d5dd' : '#344054', 
                    fontWeight: 600, 
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                    fontSize: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    boxShadow: currentPage === 1 ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.05)' 
                  }}
                >
                  <ChevronLeft size={15} /> Trang trước
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.2rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 6, 
                        border: page === currentPage ? 'none' : '1px solid #d0d5dd', 
                        background: page === currentPage ? '#0f766e' : '#ffffff', 
                        color: page === currentPage ? '#ffffff' : '#344054', 
                        fontWeight: page === currentPage ? 700 : 600, 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        boxShadow: page === currentPage ? '0 2px 4px rgba(15, 118, 110, 0.25)' : 'none' 
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ 
                    height: 32,
                    padding: '0 0.75rem', 
                    borderRadius: 6, 
                    border: '1px solid #d0d5dd', 
                    background: currentPage === totalPages ? '#f8fafc' : '#ffffff', 
                    color: currentPage === totalPages ? '#d0d5dd' : '#344054', 
                    fontWeight: 600, 
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                    fontSize: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    boxShadow: currentPage === totalPages ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.05)'
                  }}
                >
                  Trang sau <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: 380, maxWidth: '100%', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <Trash2 size={28} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 700, color: '#101828' }}>Xác nhận xóa {selectedIds.length} tin đăng</h3>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1.25rem' }}>Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsBulkDeleteOpen(false)} style={{ flex: 1, background: '#f2f4f7', color: '#344054', border: '1px solid #d0d5dd', borderRadius: 8, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button onClick={executeBulkDelete} style={{ flex: 1, background: '#b42318', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)' }}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
