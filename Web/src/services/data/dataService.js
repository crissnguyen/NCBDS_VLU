import { CONFIG } from './config';
import { localStore } from './localStore';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  if (!file || !(file instanceof File)) {
    resolve(null);
    return;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

export const dataService = {
  // Kiểm tra chế độ chạy
  isLocalMode: () => CONFIG.MODE === 'local',

  // Lấy chế độ chạy hiện tại dạng text hiển thị
  getModeLabel: () => CONFIG.MODE === 'local' ? 'Local Storage' : `API Server (${CONFIG.API_BASE})`,

  // --- TIN TỨC (NEWS) ---
  getNews: async () => {
    if (dataService.isLocalMode()) {
      return { success: true, data: localStore.get(CONFIG.LOCAL_KEYS.NEWS) };
    }
    const res = await fetch(`${CONFIG.API_BASE}/news`);
    return await res.json();
  },

  createNews: async (formData) => {
    if (dataService.isLocalMode()) {
      let imageUrl = formData.get('image') || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
      const file = formData.get('imageFile');
      if (file && file instanceof File) {
        imageUrl = await fileToBase64(file);
      }
      const newsItem = {
        title: formData.get('title'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        sourceUrl: formData.get('sourceUrl'),
        category: formData.get('category'),
        featured: formData.get('featured') === 'true',
        image: imageUrl
      };
      const created = localStore.insert(CONFIG.LOCAL_KEYS.NEWS, newsItem);
      return { success: true, data: created };
    }

    const res = await fetch(`${CONFIG.API_BASE}/news`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  updateNews: async (id, formData) => {
    if (dataService.isLocalMode()) {
      const newsItem = {
        title: formData.get('title'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        sourceUrl: formData.get('sourceUrl'),
        category: formData.get('category'),
        featured: formData.get('featured') === 'true'
      };
      const file = formData.get('imageFile');
      if (file && file instanceof File) {
        newsItem.image = await fileToBase64(file);
      } else if (formData.get('image')) {
        newsItem.image = formData.get('image');
      }
      const updated = localStore.update(CONFIG.LOCAL_KEYS.NEWS, id, newsItem);
      return { success: true, data: updated };
    }

    const res = await fetch(`${CONFIG.API_BASE}/news/${id}`, {
      method: 'PUT',
      body: formData
    });
    return await res.json();
  },

  deleteNews: async (id) => {
    if (dataService.isLocalMode()) {
      localStore.delete(CONFIG.LOCAL_KEYS.NEWS, id);
      return { success: true };
    }
    const res = await fetch(`${CONFIG.API_BASE}/news/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // --- BẤT ĐỘNG SẢN (PROPERTIES) ---
  getProperties: async ({ authorId, refresh } = {}) => {
    if (dataService.isLocalMode()) {
      let list = localStore.get(CONFIG.LOCAL_KEYS.PROPERTIES);
      if (authorId) {
        const ownItems = list.filter(item => item.authorId === authorId);
        list = ownItems.length > 0 ? ownItems : list;
      }
      return list;
    }

    const params = new URLSearchParams();
    if (authorId) params.set('authorId', authorId);
    if (refresh) params.set('refresh', refresh);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${CONFIG.API_BASE}/properties${query}`, { cache: 'no-store' });
    return await res.json();
  },

  getProperty: async (id) => {
    if (dataService.isLocalMode()) {
      const item = localStore.get(CONFIG.LOCAL_KEYS.PROPERTIES).find(property => property.id === id);
      return item || null;
    }

    const res = await fetch(`${CONFIG.API_BASE}/properties/${id}`);
    return await res.json();
  },

  createProperty: async (formData) => {
    if (dataService.isLocalMode()) {
      const imageFiles = formData.getAll('images');
      const images = [];
      for (const file of imageFiles) {
        if (file && file instanceof File) {
          images.push(await fileToBase64(file));
        }
      }

      const property = {
        title: formData.get('title'),
        price: formData.get('price'),
        location: formData.get('location'),
        beds: formData.get('beds') ? Number(formData.get('beds')) : null,
        baths: formData.get('baths') ? Number(formData.get('baths')) : null,
        area: formData.get('area') ? Number(formData.get('area')) : null,
        description: formData.get('description') || '',
        transactionType: formData.get('transactionType') || 'sale',
        propertyType: formData.get('propertyType') || 'apartment',
        legalStatus: formData.get('legalStatus') || 'pink-book',
        authorId: formData.get('authorId') || null,
        status: formData.get('status') || 'Pending',
        images,
        updatedAt: new Date().toISOString()
      };

      const created = localStore.insert(CONFIG.LOCAL_KEYS.PROPERTIES, property);
      return { success: true, data: created, local: true };
    }

    const res = await fetch(`${CONFIG.API_BASE}/properties`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  importProperties: async (rows) => {
    if (dataService.isLocalMode()) {
      const created = rows.map(row => localStore.insert(CONFIG.LOCAL_KEYS.PROPERTIES, {
        ...row,
        status: row.status || 'Approved',
        updatedAt: new Date().toISOString(),
      }));
      return { success: true, imported: created.length, skipped: 0 };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/properties/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    return await res.json();
  },

  // Lấy danh sách tin chưa đồng bộ
  getUnsyncedNewsCount: () => {
    const list = localStore.get(CONFIG.LOCAL_KEYS.NEWS);
    return list.filter(item => !item.isSynced).length;
  },

  // Đồng bộ toàn bộ tin tức local lên server
  syncNews: async (onProgress) => {
    const list = localStore.get(CONFIG.LOCAL_KEYS.NEWS);
    const unsynced = list.filter(item => !item.isSynced);
    
    if (unsynced.length === 0) {
      return { success: true, count: 0, message: 'Tất cả dữ liệu đã được đồng bộ' };
    }

    let successCount = 0;
    for (let i = 0; i < unsynced.length; i++) {
      const item = unsynced[i];
      try {
        const formData = new FormData();
        formData.append('title', item.title);
        formData.append('excerpt', item.excerpt);
        formData.append('content', item.content || '');
        formData.append('sourceUrl', item.sourceUrl || '');
        formData.append('category', item.category);
        formData.append('featured', item.featured);
        formData.append('image', item.image);

        const res = await fetch(`${CONFIG.API_BASE}/news`, {
          method: 'POST',
          body: formData
        });
        const resData = await res.json();
        
        if (res.ok && resData.success) {
          // Cập nhật trạng thái đã đồng bộ trong localStorage
          const currentList = localStore.get(CONFIG.LOCAL_KEYS.NEWS);
          const index = currentList.findIndex(n => n.id === item.id);
          if (index !== -1) {
            currentList[index].isSynced = true;
            localStore.set(CONFIG.LOCAL_KEYS.NEWS, currentList);
          }
          successCount++;
        }
      } catch (err) {
        console.error(`Lỗi đồng bộ bài viết ${item.title}:`, err);
      }
      if (onProgress) {
        onProgress(Math.round(((i + 1) / unsynced.length) * 100));
      }
    }

    return {
      success: true,
      count: successCount,
      message: `Đồng bộ thành công ${successCount}/${unsynced.length} bài viết.`
    };
  },

  // --- LIÊN HỆ (CONTACTS) ---
  getContacts: async () => {
    if (dataService.isLocalMode()) {
      return { success: true, data: localStore.get(CONFIG.LOCAL_KEYS.CONTACTS) };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts`);
    return await res.json();
  },

  createContactRequest: async (contactData) => {
    if (dataService.isLocalMode()) {
      const created = localStore.insert(CONFIG.LOCAL_KEYS.CONTACTS, {
        ...contactData,
        status: 'Pending'
      });
      return { success: true, data: created };
    }
    const res = await fetch(`${CONFIG.API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return await res.json();
  },

  replyContactRequest: async (id, replyText, subject) => {
    if (dataService.isLocalMode()) {
      const updated = localStore.update(CONFIG.LOCAL_KEYS.CONTACTS, id, {
        status: 'Replied',
        replyText
      });
      return { success: true, data: updated };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText, subject })
    });
    return await res.json();
  },

  addContactRequest: async (contactData) => {
    if (dataService.isLocalMode()) {
      const created = localStore.insert(CONFIG.LOCAL_KEYS.CONTACTS, contactData);
      return { success: true, data: created };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return await res.json();
  },

  updateContactRequest: async (id, contactData) => {
    if (dataService.isLocalMode()) {
      const updated = localStore.update(CONFIG.LOCAL_KEYS.CONTACTS, id, contactData);
      return { success: true, data: updated };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return await res.json();
  },

  deleteContactRequest: async (id) => {
    if (dataService.isLocalMode()) {
      localStore.delete(CONFIG.LOCAL_KEYS.CONTACTS, id);
      return { success: true };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  bulkDeleteContactRequests: async (ids) => {
    if (dataService.isLocalMode()) {
      ids.forEach(id => localStore.delete(CONFIG.LOCAL_KEYS.CONTACTS, id));
      return { success: true };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/contacts/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return await res.json();
  },

  bulkDeleteNews: async (ids) => {
    if (dataService.isLocalMode()) {
      ids.forEach(id => localStore.delete(CONFIG.LOCAL_KEYS.NEWS, id));
      return { success: true };
    }
    const res = await fetch(`${CONFIG.API_BASE}/news/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return await res.json();
  },

  bulkDeleteProperties: async (ids) => {
    if (dataService.isLocalMode()) {
      ids.forEach(id => localStore.delete(CONFIG.LOCAL_KEYS.PROPERTIES, id));
      return { success: true };
    }
    const res = await fetch(`${CONFIG.API_BASE}/admin/properties/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return await res.json();
  }
};
