import { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, Building2, Edit3, SlidersHorizontal, Upload, FileSpreadsheet, X, MoreVertical, Sparkles } from 'lucide-react';
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
  const [scanStats, setScanStats] = useState(null); // Thông số Scanner
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

  // -------------------------------------------------------------
  // SMART DATA SCANNER: Tự động quét và lọc dữ liệu từ file gốc bất kỳ
  // -------------------------------------------------------------
  const cleanStr = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

  const KEYWORD_MAP = {
    title: ['tieude', 'tentin', 'tenbds', 'tensanpham', 'tensp', 'tennha', 'tencan', 'sanpham', 'duan', 'bds', 'title', 'name', 'property', 'tensanpham'],
    price: ['gia', 'mucgia', 'giaban', 'giathue', 'tonggia', 'tongtien', 'dongia', 'thanhtien', 'giatien', 'price', 'cost'],
    location: ['vitri', 'diachi', 'khuvuc', 'tinhthanh', 'quan', 'huyen', 'phuong', 'duong', 'toalac', 'location', 'address', 'city'],
    area: ['dientich', 'dtxd', 'dtsd', 'dt', 'm2', 'metvuong', 'area', 'size'],
    beds: ['phongngu', 'sophongngu', 'sopn', 'pn', 'ngu', 'beds', 'bedroom'],
    baths: ['phongtam', 'sophongtam', 'sowc', 'wc', 'pt', 'vesinh', 'baths', 'bathroom'],
    transactionType: ['hinhthuc', 'loaigiaodich', 'giaodich', 'loaigd', 'banthue', 'transactiontype', 'type'],
    propertyType: ['loaibds', 'loai', 'phanloai', 'loainhadat', 'loaisanpham', 'propertytype'],
    legalStatus: ['phaply', 'tinhtrangphaply', 'giayto', 'sodo', 'sohong', 'legalstatus'],
    description: ['mota', 'motachitiet', 'noidung', 'ghichu', 'thongtinthem', 'description', 'notes'],
    imageUrl: ['anh', 'hinhanh', 'linkanh', 'urlanh', 'image', 'photo', 'imageurl'],
    status: ['trangthai', 'tinhtrang', 'tinhtrangduyet', 'duyet', 'status']
  };

  const scanAndNormalizeProperties = (matrix) => {
    if (!matrix || !matrix.length) {
      return { rows: [], stats: { totalRows: 0, validCount: 0, skippedCount: 0 } };
    }

    // 1. Tự động quét tìm Dòng Header thực sự trong 12 dòng đầu
    let headerRowIndex = -1;
    let maxScore = 0;
    let bestColMap = {};

    for (let r = 0; r < Math.min(12, matrix.length); r++) {
      const row = matrix[r];
      if (!row || !Array.isArray(row)) continue;
      let score = 0;
      const currentMap = {};

      row.forEach((cell, colIdx) => {
        const cleanCell = cleanStr(cell).replace(/[\(\*\)\/\s_-]+/g, '');
        if (!cleanCell) return;

        for (const [field, keywords] of Object.entries(KEYWORD_MAP)) {
          if (keywords.some(kw => cleanCell.includes(kw) || kw.includes(cleanCell))) {
            if (!currentMap[field]) {
              currentMap[field] = colIdx;
              score += 1;
            }
            break;
          }
        }
      });

      if (score > maxScore && score >= 2) {
        maxScore = score;
        headerRowIndex = r;
        bestColMap = currentMap;
      }
    }

    // Nếu không tìm thấy header rõ ràng, thử dùng dòng 0 làm mặc định
    const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
    const resultRows = [];
    let skippedCount = 0;

    for (let r = startRow; r < matrix.length; r++) {
      const rawRow = matrix[r];
      if (!rawRow || !Array.isArray(rawRow)) continue;

      // 2. Tự động lọc các dòng trống
      const hasContent = rawRow.some(cell => String(cell || '').trim() !== '');
      if (!hasContent) {
        skippedCount++;
        continue;
      }

      // 3. Tự động lọc các dòng tổng cộng / footer / ghi chú rác
      const rowCombined = rawRow.map(c => cleanStr(c)).join(' ');
      if (
        rowCombined.includes('tong cong') ||
        rowCombined.includes('total') ||
        rowCombined.includes('bao cao') ||
        rowCombined.includes('nguoi lap') ||
        rowCombined.includes('chu ky') ||
        rowCombined.includes('ke toan') ||
        rowCombined.includes('trang ')
      ) {
        skippedCount++;
        continue;
      }

      const rowObj = {};
      for (const [field, colIdx] of Object.entries(bestColMap)) {
        const val = rawRow[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          rowObj[field] = String(val).trim();
        }
      }

      // 4. Scanner Fallback: Bóc tách thông tin tự động khi cột bị thiếu
      const combinedText = (rowObj.title || '') + ' ' + (rowObj.description || '') + ' ' + rowCombined;

      // Trích xuất Mức giá nếu cột giá trống
      if (!rowObj.price && combinedText) {
        const priceMatch = combinedText.match(/(\d+([.,]\d+)?)\s*(tỷ|ty|triệu|trieu|tr|usd|vnd|đ)/i);
        if (priceMatch) rowObj.price = priceMatch[0];
      }

      // Trích xuất Diện tích nếu cột diện tích trống
      if (!rowObj.area && combinedText) {
        const areaMatch = combinedText.match(/(\d+([.,]\d+)?)\s*(m2|m²|mét vuông)/i);
        if (areaMatch) rowObj.area = areaMatch[1].replace(',', '.');
      }

      // Trích xuất Phòng ngủ nếu trống
      if (!rowObj.beds && combinedText) {
        const bedsMatch = combinedText.match(/(\d+)\s*(pn|phòng ngủ|phong ngu|bed)/i);
        if (bedsMatch) rowObj.beds = bedsMatch[1];
      }

      // Trích xuất Phòng tắm nếu trống
      if (!rowObj.baths && combinedText) {
        const bathsMatch = combinedText.match(/(\d+)\s*(wc|phòng tắm|phong tam|bath)/i);
        if (bathsMatch) rowObj.baths = bathsMatch[1];
      }

      // Chuẩn hóa Hình thức (Bán / Cho thuê)
      if (rowObj.transactionType) {
        const t = cleanStr(rowObj.transactionType);
        rowObj.transactionType = (t.includes('thue') || t.includes('rent')) ? 'rent' : 'sale';
      } else {
        const t = cleanStr(combinedText);
        rowObj.transactionType = (t.includes('cho thue') || t.includes('thuê') || t.includes('rent')) ? 'rent' : 'sale';
      }

      // Chuẩn hóa Loại BĐS
      if (rowObj.propertyType) {
        const p = cleanStr(rowObj.propertyType);
        if (p.includes('can ho') || p.includes('chung cu') || p.includes('apartment')) rowObj.propertyType = 'apartment';
        else if (p.includes('biet thu') || p.includes('villa')) rowObj.propertyType = 'villa';
        else if (p.includes('dat') || p.includes('land')) rowObj.propertyType = 'land';
        else if (p.includes('shophouse') || p.includes('thuong mai')) rowObj.propertyType = 'shophouse';
        else if (p.includes('nha') || p.includes('house') || p.includes('townhouse')) rowObj.propertyType = 'house';
        else rowObj.propertyType = 'apartment';
      } else {
        const p = cleanStr(combinedText);
        if (p.includes('can ho') || p.includes('chung cu')) rowObj.propertyType = 'apartment';
        else if (p.includes('biet thu') || p.includes('villa')) rowObj.propertyType = 'villa';
        else if (p.includes('dat') || p.includes('đất')) rowObj.propertyType = 'land';
        else if (p.includes('shophouse')) rowObj.propertyType = 'shophouse';
        else if (p.includes('nha') || p.includes('nhà')) rowObj.propertyType = 'house';
        else rowObj.propertyType = 'apartment';
      }

      // Chuẩn hóa Trạng thái
      if (rowObj.status) {
        const s = cleanStr(rowObj.status);
        rowObj.status = (s.includes('da duyet') || s.includes('approved') || s.includes('hoat dong') || s.includes('active')) ? 'Approved' : 'Pending';
      } else {
        rowObj.status = 'Pending';
      }

      // 5. Kiểm tra tính hợp lệ tối thiểu của tin đăng
      const titleClean = String(rowObj.title || '').trim();
      const isValid = titleClean.length >= 5 && 
                      !/^\d+\s*(căn|tin|bds|can|lo)?$/i.test(titleClean) && 
                      (Boolean(rowObj.price) || Boolean(rowObj.location));

      if (isValid) {
        resultRows.push(rowObj);
      } else {
        skippedCount++;
      }
    }

    return {
      rows: resultRows,
      stats: {
        totalRows: matrix.length,
        validCount: resultRows.length,
        skippedCount,
        headerRowIndex: headerRowIndex >= 0 ? headerRowIndex + 1 : 1,
        detectedFields: Object.keys(bestColMap)
      }
    };
  };

  const handleImportFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        toast?.warning('Không tìm thấy dữ liệu', 'File không chứa trang tính (sheet) nào.');
        return;
      }
      const firstSheet = workbook.Sheets[sheetName];
      // Đọc toàn bộ trang tính thành ma trận 2 chiều thô (header: 1) để Scanner tự do quét tìm tiêu đề ở mọi dòng
      const rawMatrix = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      const { rows, stats } = scanAndNormalizeProperties(rawMatrix);
      if (!rows.length) {
        toast?.warning('Không tìm thấy dữ liệu hợp lệ', `Scanner đã quét ${stats?.totalRows || 0} dòng nhưng không tìm thấy dữ liệu bất động sản phù hợp. Vui lòng kiểm tra lại file.`);
        return;
      }
      setImportFileName(file.name);
      setImportRows(rows);
      setScanStats(stats);
      setIsImportOpen(true);
      toast?.success('Scanner bóc tách thành công', `Đã quét và lọc được ${rows.length} tin đăng hợp lệ (tự động loại bỏ ${stats?.skippedCount || 0} dòng rác/trống).`);
    } catch (err) {
      console.error('Import error:', err);
      toast?.error('Import thất bại', 'Không thể đọc file. Vui lòng kiểm tra file Excel (.xlsx, .xls) hoặc CSV.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSetAllStatus = (newStatus) => {
    setImportRows(prev => prev.map(r => ({ ...r, status: newStatus })));
  };

  const executeImport = async () => {
    const validRows = importRows.filter(row => row.title && row.price && row.location);
    if (!validRows.length) return toast?.warning('Thiếu dữ liệu', 'Mỗi tin đăng cần có Tiêu đề, Mức giá và Vị trí.');
    setIsImporting(true);
    try {
      const result = await dataService.importProperties(validRows);
      if (!result.success) throw new Error(result.message || 'Import thất bại.');
      toast?.success('Import thành công', result.message || `Đã import ${result.imported} tin đăng vào hệ thống.`);
      setImportRows([]); 
      setImportFileName(''); 
      setScanStats(null);
      setIsImportOpen(false);
      await fetchData?.();
    } catch (error) {
      toast?.error('Import thất bại', error.message || 'Không thể kết nối máy chủ.');
    } finally { 
      setIsImporting(false); 
    }
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
          <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain" onChange={handleImportFile} hidden />
          <a className="admin-table-btn-secondary" href="/mau-import-tin-dang.xlsx" download title="Tải file Excel mẫu">
            <FileSpreadsheet size={15} /> Mẫu Excel
          </a>
          <button className="admin-table-btn-primary" onClick={() => setIsImportOpen(true)}>
            <Upload size={15} /> Import file / Scan
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
          <div style={{ fontWeight: 'var(--font-weight-subheading)', color: '#101828' }}>Không tìm thấy tin đăng nào</div>
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
                            <div style={{ fontWeight: 'var(--font-weight-subheading)', color: '#101828', fontSize: '0.875rem', marginBottom: 2 }}>{p.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#667085' }}>
                              <strong style={{ color: '#0f766e', fontWeight: 'var(--font-weight-subheading)' }}>{p.price}</strong> • {p.location}
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
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-subheading)', fontSize: '0.72rem', flexShrink: 0 }}>
                            {(p.author?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 'var(--font-weight-subheading)', color: '#344054', fontSize: '0.85rem' }}>{p.author?.name || 'Admin System'}</span>
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
                          fontWeight: 'var(--font-weight-subheading)',
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
                                  fontWeight: 'var(--font-weight-button)',
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
                                  fontWeight: 'var(--font-weight-button)',
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
        <div className="property-import-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="property-import-modal" style={{ width: 880, maxWidth: '96vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 18, background: '#fff', boxShadow: '0 24px 70px rgba(15,42,67,0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div className="property-import-modal-head" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #edf2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdfa', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#102a43', fontSize: '1.05rem', fontWeight: 600 }}>Import tin đăng bất động sản</h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                    {importFileName ? `${importFileName} · ${importRows.length} dòng dữ liệu` : 'Tải lên danh sách tin đăng từ Excel'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportOpen(false);
                  setScanStats(null);
                }}
                style={{ border: 0, borderRadius: 8, padding: '0.4rem', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Help / Guide Box */}
            <div style={{ margin: '0.9rem 1.25rem 0.6rem', padding: '0.75rem 1rem', borderRadius: 12, background: '#f0fdfa', border: '1px solid #ccfbf1', color: '#334155', fontSize: '0.78rem', lineHeight: 1.5 }}>
              <div>
                Cột bắt buộc: <strong style={{ color: '#0f766e' }}>Tiêu đề tin, Mức giá, Vị trí</strong>. Các cột tùy chọn khác: Diện tích, Số PN, Số WC, Hình thức, Loại BĐS, Pháp lý, Mô tả, Link ảnh, Trạng thái.
              </div>
              <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a className="property-import-template-link" href="/mau-import-tin-dang.xlsx" download style={{ color: '#0f766e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                  <FileSpreadsheet size={14} /> Tải file mẫu Tiếng Việt (.xlsx có Dropdown chọn)
                </a>
                <a className="property-import-template-link" href="/mau-import-tin-dang.csv" download style={{ color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                  Tải file mẫu CSV
                </a>
              </div>
            </div>

            {/* Smart Scanner Detection Banner */}
            {scanStats && (
              <div style={{ margin: '0 1.25rem 0.6rem', padding: '0.7rem 1rem', borderRadius: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5b21b6' }}>
                      Bộ quét thông minh (Smart Scanner) đã phân tích file
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#6d28d9', marginTop: 2 }}>
                      Tìm thấy hàng tiêu đề tại dòng <strong>#{scanStats.headerRowIndex}</strong> · Tự động nhận diện <strong>{scanStats.detectedFields?.length || 0}</strong> cột dữ liệu
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontSize: '0.73rem', fontWeight: 600 }}>
                    ✓ Lấy được: {scanStats.validCount} tin hợp lệ
                  </span>
                  {scanStats.skippedCount > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: '0.73rem', fontWeight: 600 }}>
                      ✕ Tự lọc bỏ: {scanStats.skippedCount} dòng rác/trống
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!importRows.length && (
              <div className="property-import-empty" style={{ margin: '1rem 1.25rem', padding: '2.5rem 1rem', border: '2px dashed #b9dcd8', borderRadius: 14, background: '#f8fffe', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={40} color="#0f766e" />
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Chưa chọn file dữ liệu</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: 450, lineHeight: 1.5 }}>
                  Bạn có thể chọn file Excel (.xlsx, .xls) hoặc CSV gốc bất kỳ. Bộ quét (Scanner) sẽ tự động tìm dòng tiêu đề, lọc bỏ dòng rác và bóc tách thông tin tin đăng.
                </span>
                <button 
                  onClick={() => importInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.5rem', padding: '0.65rem 1.25rem', border: 0, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,118,110,0.25)' }}
                >
                  <Upload size={16} /> Chọn file Excel / CSV từ máy tính
                </button>
              </div>
            )}

            {/* Preview Data Grid with Dropdown Status */}
            {importRows.length > 0 && (
              <div style={{ margin: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, minHeight: 0 }}>
                {/* Batch status setting toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.4rem 0.2rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    Danh sách xem trước ({importRows.length} tin) · <span style={{ color: '#0f766e', fontWeight: 400 }}>Bạn có thể chọn lại trạng thái trực tiếp bên dưới</span>:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Đặt nhanh tất cả:</span>
                    <button
                      type="button"
                      onClick={() => handleSetAllStatus('Approved')}
                      style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #a6f4c5', background: '#ecfdf5', color: '#027a48', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✓ Tất cả: Đã duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllStatus('Pending')}
                      style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #fedf89', background: '#fffaeb', color: '#b54708', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⏱ Tất cả: Chờ duyệt
                    </button>
                  </div>
                </div>

                {/* Scrollable Preview Table */}
                <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '8px 10px', width: '36px', textAlign: 'center', color: '#64748b' }}>#</th>
                        <th style={{ padding: '8px 10px', minWidth: '180px', color: '#475569' }}>Tiêu đề tin đăng</th>
                        <th style={{ padding: '8px 10px', width: '110px', color: '#475569' }}>Mức giá</th>
                        <th style={{ padding: '8px 10px', minWidth: '130px', color: '#475569' }}>Vị trí / Địa chỉ</th>
                        <th style={{ padding: '8px 10px', width: '110px', color: '#475569' }}>Hình thức / Loại</th>
                        <th style={{ padding: '8px 10px', width: '145px', textAlign: 'center', color: '#0f766e', fontWeight: 700 }}>Trạng thái (Dạng chọn)</th>
                        <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8' }}>{index + 1}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <strong style={{ color: '#0f172a', display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.title}>
                              {row.title || <span style={{ color: '#ef4444' }}>(Thiếu tiêu đề)</span>}
                            </strong>
                            {row.area && <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{row.area} m² · </span>}
                            {row.beds && <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{row.beds} PN · </span>}
                            {row.baths && <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{row.baths} WC</span>}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f766e' }}>
                            {row.price || <span style={{ color: '#ef4444' }}>(Thiếu giá)</span>}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>
                            <span style={{ display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.location}>
                              {row.location || <span style={{ color: '#ef4444' }}>(Thiếu vị trí)</span>}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>
                            <span style={{ padding: '2px 6px', borderRadius: 4, background: row.transactionType === 'rent' ? '#f3e8ff' : '#e0f2fe', color: row.transactionType === 'rent' ? '#6b21a8' : '#0369a1', fontSize: '0.72rem', fontWeight: 600 }}>
                              {row.transactionType === 'rent' ? 'Cho thuê' : 'Bán'}
                            </span>
                            <span style={{ marginLeft: 4, fontSize: '0.72rem', color: '#64748b' }}>
                              {getPropertyTypeName(row.propertyType)}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            {/* Dropdown status selector directly on row */}
                            <select
                              aria-label={`Trạng thái tin ${index + 1}`}
                              value={row.status || 'Pending'}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setImportRows(prev => prev.map((r, i) => i === index ? { ...r, status: newStatus } : r));
                              }}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: 7,
                                border: row.status === 'Approved' ? '1px solid #a6f4c5' : '1px solid #fedf89',
                                background: row.status === 'Approved' ? '#ecfdf5' : '#fffaeb',
                                color: row.status === 'Approved' ? '#027a48' : '#b54708',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Approved">✓ Đã duyệt (Approved)</option>
                              <option value="Pending">⏱ Chờ duyệt (Pending)</option>
                            </select>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setImportRows(prev => prev.filter((_, i) => i !== index))}
                              title="Bỏ dòng này"
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="property-import-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #edf2f6', background: '#fafbfc' }}>
              <button 
                type="button"
                onClick={() => importInputRef.current?.click()}
                style={{ padding: '0.55rem 0.95rem', borderRadius: 9, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Upload size={14} /> {importRows.length ? 'Chọn file khác' : 'Chọn file Excel'}
              </button>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  type="button"
                  onClick={() => { setIsImportOpen(false); setImportRows([]); setImportFileName(''); }}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: 9, border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                {importRows.length > 0 && (
                  <button 
                    type="button"
                    onClick={executeImport} 
                    disabled={isImporting}
                    style={{ padding: '0.55rem 1.4rem', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #0f766e, #0891b2)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,118,110,0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={14} /> {isImporting ? 'Đang import dữ liệu...' : `Xác nhận Import ${importRows.length} tin`}
                  </button>
                )}
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
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 'var(--font-weight-subheading)', color: '#101828' }}>Xác nhận xóa {selectedIds.length} tin đăng</h3>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1.25rem' }}>Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsBulkDeleteOpen(false)} style={{ flex: 1, background: '#f2f4f7', color: '#344054', border: '1px solid #d0d5dd', borderRadius: 8, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer' }}>Hủy</button>
              <button onClick={executeBulkDelete} style={{ flex: 1, background: '#b42318', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 'var(--font-weight-button)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)' }}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
