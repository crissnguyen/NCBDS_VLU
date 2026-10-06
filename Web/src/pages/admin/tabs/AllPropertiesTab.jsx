import { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, Building2, Edit3, SlidersHorizontal, Upload, FileSpreadsheet, X, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { mediaUrl } from '../../../services/api';
import { dataService } from '../../../services/data/dataService';

export default function AllPropertiesTab({ allProperties = [], setEditingProperty, handleDeleteProperty, handleApproveProperty, fetchData, toast }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef(null);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const normalizeImportRows = (rows) => {
    const aliases = { tieude: 'title', title: 'title', gia: 'price', price: 'price', vitri: 'location', location: 'location', dientich: 'area', area: 'area', phongngu: 'beds', beds: 'beds', phongtam: 'baths', baths: 'baths', mota: 'description', description: 'description', hinhthuc: 'transactionType', transactiontype: 'transactionType', loai: 'propertyType', propertytype: 'propertyType', phaply: 'legalStatus', legalstatus: 'legalStatus', hinhanh: 'imageUrl', imageurl: 'imageUrl', trangthai: 'status', status: 'status' };
    return rows.map(sourceRow => Object.entries(sourceRow).reduce((row, [header, value]) => {
        const normalizedHeader = String(header).toLowerCase().trim().replace(/\s+/g, '').replace(/đ/g, 'd');
        const key = aliases[normalizedHeader];
        if (key && value !== '' && value !== null && value !== undefined) row[key] = String(value).trim();
        return row;
      }, {})).filter(row => row.title || row.price || row.location);
  };

  const handleImportFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = normalizeImportRows(XLSX.utils.sheet_to_json(firstSheet, { defval: '' }));
      setImportFileName(file.name);
      setImportRows(rows);
      setIsImportOpen(true);
    } catch {
      toast?.error('Import thất bại', 'Không thể đọc file Excel (.xlsx).');
    } finally {
      event.target.value = '';
    }
  };

  const executeImport = async () => {
    const validRows = importRows.filter(row => row.title && row.price && row.location);
    if (!validRows.length) return toast?.warning('Thiếu dữ liệu', 'Cần có title, price và location.');
    setIsImporting(true);
    try {
      const result = await dataService.importProperties(validRows);
      if (!result.success) throw new Error(result.message || 'Import thất bại.');
      toast?.success('Import thành công', result.message || `Đã import ${result.imported} tin.`);
      setImportRows([]); setImportFileName(''); setIsImportOpen(false);
      await fetchData?.();
    } catch (error) {
      toast?.error('Import thất bại', error.message || 'Không thể kết nối máy chủ.');
    } finally { setIsImporting(false); }
  };

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
    <div className="admin-table-card property-list-card">
      {/* 1. Unified Table Card Top Toolbar Header */}
      <div className="admin-table-header-toolbar">
        {/* Title & Count Badge */}
        <div className="admin-table-header-left">
          <div className="admin-table-header-icon"><Building2 size={20} /></div>
          <div className="admin-table-header-info">
            <div className="admin-table-header-title-row">
              <h2 className="admin-table-header-title">Tất cả tin đăng</h2>
              <span className="admin-table-count-badge">{filteredProperties.length} tin</span>
            </div>
            <p className="admin-table-header-subtitle">Theo dõi và quản lý toàn bộ tin bất động sản</p>
          </div>
        </div>

        {/* Right Search, Filters & Import Actions */}
        <div className="admin-table-header-right property-list-actions">
          <input ref={importInputRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={handleImportFile} hidden />
          <a className="admin-table-btn-secondary" href="/mau-import-tin-dang.xlsx" download title="Tải file Excel mẫu">
            <FileSpreadsheet size={15} /> Mẫu Excel
          </a>
          <button className="admin-table-btn-primary" onClick={() => setIsImportOpen(true)}>
            <Upload size={15} /> Import Excel
          </button>

        </div>
      </div>

      <div className="property-list-filters">
          {/* Search Box */}
          <div className="admin-table-search-input">
            <Search size={15} color="#667085" />
            <input
              type="text"
              aria-label="Tìm tin đăng, vị trí hoặc môi giới"
              placeholder="Tìm tin đăng, vị trí, môi giới..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button aria-label="Xóa tìm kiếm" onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98a2b3', fontSize: '0.8rem', padding: 0 }}>✕</button>
            )}
          </div>

          {/* Category Filter 1: Hình thức (Bán / Cho thuê) */}
          <select 
            className="admin-table-select"
            aria-label="Hình thức"
            value={transactionFilter}
            onChange={e => setTransactionFilter(e.target.value)}
          >
            <option value="all">Tất cả hình thức</option>
            <option value="sale">Bán</option>
            <option value="rent">Cho thuê</option>
          </select>

          {/* Category Filter 2: Loại BĐS */}
          <select 
            className="admin-table-select"
            aria-label="Loại bất động sản"
            value={propertyTypeFilter}
            onChange={e => setPropertyTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại BĐS</option>
            <option value="apartment">Căn hộ</option>
            <option value="house">Nhà phố</option>
            <option value="villa">Biệt thự</option>
            <option value="land">Đất nền</option>
            <option value="shophouse">Shophouse</option>
          </select>

          {/* Status Dropdown Filter */}
          <select 
            className="admin-table-select"
            aria-label="Trạng thái"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>

          {(searchTerm || transactionFilter !== 'all' || propertyTypeFilter !== 'all' || statusFilter !== 'all') && (
            <button className="property-list-reset" onClick={() => {
              setSearchTerm('');
              setTransactionFilter('all');
              setPropertyTypeFilter('all');
              setStatusFilter('all');
            }}><X size={14} /> Xóa bộ lọc</button>
          )}
          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              className="admin-table-btn-danger"
              onClick={() => setIsBulkDeleteOpen(true)}
            >
              <Trash2 size={14} /> Xóa ({selectedIds.length})
            </button>
          )}
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
            <table className="admin-unified-table">
              <thead>
                <tr>
                  <th style={{ width: '46px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === currentProperties.length && currentProperties.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', accentColor: '#0f766e', width: 16, height: 16, verticalAlign: 'middle' }}
                    />
                  </th>
                  <th>Bất động sản</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Phân loại</th>
                  <th style={{ width: '180px' }}>Môi giới</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Thao tác</th>
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
                        <div className="property-classification">
                          <span className="property-transaction-pill" style={{
                            background: p.transactionType === 'sale' ? '#eff8ff' : '#f9f5ff',
                            color: p.transactionType === 'sale' ? '#175cd3' : '#6941c6'
                          }}>
                            {p.transactionType === 'sale' ? 'Bán' : 'Cho thuê'}
                          </span>
                          <span className="property-type-label">{getPropertyTypeName(p.propertyType)}</span>
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
                        <span className="admin-status-pill" style={{ 
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
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', position: 'relative' }}>
                        <div className="action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', textAlign: 'left' }}>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === p.id ? null : p.id);
                            }}
                            title="Thao tác"
                            aria-label="Thao tác"
                            style={{ 
                              width: 32,
                              height: 32,
                              padding: 0,
                              background: openActionId === p.id ? '#f1f5f9' : '#ffffff', 
                              color: openActionId === p.id ? '#0f766e' : '#475467', 
                              border: '1px solid #d0d5dd', 
                              borderRadius: 8, 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (openActionId !== p.id) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#98a2b3';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (openActionId !== p.id) {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#d0d5dd';
                              }
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openActionId === p.id && (
                            <div 
                              style={{ 
                                position: 'absolute',
                                right: 0,
                                ...(idx >= currentProperties.length - 2 && currentProperties.length > 3
                                  ? { bottom: '100%', marginBottom: 6 }
                                  : { top: '100%', marginTop: 6 }),
                                width: 160,
                                background: '#ffffff',
                                border: '1px solid #eaecf0',
                                borderRadius: 10,
                                boxShadow: '0 12px 24px -4px rgba(16, 24, 40, 0.14), 0 4px 6px -2px rgba(16, 24, 40, 0.05)',
                                padding: '4px',
                                zIndex: 100,
                                animation: 'fadeIn 0.12s ease'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  setEditingProperty(p);
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
                                <Edit3 size={14} color="#175cd3" />
                                <span>Chỉnh sửa</span>
                              </button>

                              <div style={{ height: 1, background: '#f2f4f7', margin: '4px 0' }} />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleDeleteProperty(p.id);
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
                                <span>Xóa tin đăng</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="property-management-pagination compact-pagination">
            <div className="property-management-pagination-summary">
              <strong>{startIndex + 1}–{endIndex}</strong> / {filteredProperties.length} tin
            </div>
            <div className="compact-pagination-controls">
              <label className="property-management-page-size compact-page-size">
                <select aria-label="Số tin mỗi trang" value={pageSize} onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}>
                  {[10, 15, 20, 50].map(size => <option key={size} value={size}>{size} / trang</option>)}
                </select>
              </label>
              <nav className="compact-pagination-pages" aria-label="Phân trang tin đăng">
                <button aria-label="Trang trước" title="Trang trước" disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .flatMap((page, index, pages) => [
                    ...(index > 0 && page - pages[index - 1] > 1
                      ? [<span key={`gap-${page}`} className="compact-pagination-gap">…</span>] : []),
                    <button key={page} aria-label={`Trang ${page}`} aria-current={page === currentPage ? 'page' : undefined}
                      onClick={() => setCurrentPage(page)}>{page}</button>
                  ])}
                <button aria-label="Trang sau" title="Trang sau" disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="property-import-overlay">
          <div className="property-import-modal">
            <div className="property-import-modal-head">
              <div><FileSpreadsheet size={20} color="#0f766e" /><div><h3>Import tin đăng</h3><p>{importFileName} · {importRows.length} dòng dữ liệu</p></div></div>
              <button onClick={() => setIsImportOpen(false)}><X size={18} /></button>
            </div>
            <div className="property-import-help">
              Cột bắt buộc: <strong>title, price, location</strong>. Cột tùy chọn: area, beds, baths, transactionType, propertyType, legalStatus, description, imageUrl, status.
              <br /><a className="property-import-template-link" href="/mau-import-tin-dang.xlsx" download>Tải file Excel mẫu (.xlsx)</a> để điền theo đúng định dạng.
            </div>
            {!importRows.length && (
              <div className="property-import-empty">
                <FileSpreadsheet size={34} />
                <strong>Chưa chọn file Excel</strong>
                <span>Chọn file dữ liệu hoặc tải file mẫu để bắt đầu.</span>
                <button onClick={() => importInputRef.current?.click()}><Upload size={16} /> Chọn file Excel</button>
              </div>
            )}
            {importRows.length > 0 && <div className="property-import-preview">
              {importRows.slice(0, 5).map((row, index) => <div key={index}><strong>{row.title || '(thiếu tiêu đề)'}</strong><span>{row.price || '—'} · {row.location || '—'}</span></div>)}
              {importRows.length > 5 && <small>Hiển thị 5/{importRows.length} dòng xem trước</small>}
            </div>}
            <div className="property-import-actions"><button onClick={() => { setIsImportOpen(false); setImportRows([]); setImportFileName(''); }}>Hủy</button>{importRows.length > 0 && <button onClick={executeImport} disabled={isImporting}>{isImporting ? 'Đang import...' : `Import ${importRows.length} tin`}</button>}</div>
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
