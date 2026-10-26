// JagoFarm CMS - PocketBase-Style Interactive Script
const state = {
  collection: 'products',
  products: [],
  projects: [],
  search: '',
  statusFilter: 'all',
  sortField: 'name',
  sortAsc: true,
  activeRecord: null, // null = new record, object = editing existing
  isEditing: false,
  isDirty: false,
};

const CATEGORIES = {
  akuakultur: 'Akuakultur',
  nutrisi: 'Nutrisi & Pupuk',
  tanaman: 'Tanaman',
  teknologi: 'Teknologi',
};

const ICONS = ['sensor', 'fish', 'leaf', 'plant'];

// Elements
const navProducts = document.getElementById('nav-products');
const navProjects = document.getElementById('nav-projects');
const countProducts = document.getElementById('count-products');
const countProjects = document.getElementById('count-projects');
const pageTitle = document.getElementById('page-title');
const recordCountText = document.getElementById('record-count-text');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const filterStatus = document.getElementById('filter-status');
const btnNewRecord = document.getElementById('btn-new-record');
const tableBody = document.getElementById('table-body');
const emptyState = document.getElementById('empty-state');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const recordDrawer = document.getElementById('record-drawer');
const drawerTitle = document.getElementById('drawer-title');
const drawerClose = document.getElementById('drawer-close');
const drawerForm = document.getElementById('drawer-form');
const drawerBtnDelete = document.getElementById('drawer-btn-delete');
const drawerBtnCancel = document.getElementById('drawer-btn-cancel');
const drawerBtnSave = document.getElementById('drawer-btn-save');
const saveSpinner = document.getElementById('save-spinner');
const toastContainer = document.getElementById('toast-container');
const btnOpenLogs = document.getElementById('btn-open-logs');
const logsBackdrop = document.getElementById('logs-backdrop');
const logsDrawer = document.getElementById('logs-drawer');
const logsClose = document.getElementById('logs-close');
const btnRunBuild = document.getElementById('btn-run-build');
const logsPre = document.getElementById('logs-pre');

// Toast notifications
export function showToast(message, type = 'success', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `pb-toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">&times;</button>
  `;
  toast.querySelector('button').onclick = () => toast.remove();
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// Data Fetching
async function loadData() {
  try {
    const [resProducts, resProjects] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]);
    state.products = resProducts;
    state.projects = resProjects;
    updateCounts();
    populateStatusFilter();
    renderTable();
  } catch (err) {
    showToast('Failed to load data: ' + err.message, 'error');
  }
}

function updateCounts() {
  countProducts.textContent = state.products.length;
  countProjects.textContent = state.projects.length;
}

function populateStatusFilter() {
  filterStatus.innerHTML = '<option value="all">All statuses</option>';
  if (state.collection === 'products') {
    filterStatus.innerHTML += `
      <option value="prototype">Prototype</option>
      <option value="riset">Dalam eksplorasi (riset)</option>
    `;
  } else {
    filterStatus.innerHTML += `
      <option value="berjalan">Berjalan</option>
      <option value="selesai">Selesai</option>
    `;
  }
  filterStatus.value = state.statusFilter;
}

function getRecords() {
  return state.collection === 'products' ? state.products : state.projects;
}

function setRecords(newRecords) {
  if (state.collection === 'products') {
    state.products = newRecords;
  } else {
    state.projects = newRecords;
  }
}

// Switching Collections
function switchCollection(col) {
  if (state.collection === col) return;
  state.collection = col;
  state.search = '';
  searchInput.value = '';
  searchClear.style.display = 'none';
  state.statusFilter = 'all';

  if (col === 'products') {
    navProducts.classList.add('active');
    navProjects.classList.remove('active');
    pageTitle.textContent = 'Products';
  } else {
    navProjects.classList.add('active');
    navProducts.classList.remove('active');
    pageTitle.textContent = 'Projects';
  }

  populateStatusFilter();
  renderTable();
}

// Filtering and Sorting
function getFilteredRecords() {
  let records = [...getRecords()];
  const q = state.search.trim().toLowerCase();

  if (q) {
    records = records.filter(r => {
      const name = (r.name || '').toLowerCase();
      const idOrSlug = (r.id || r.slug || '').toLowerCase();
      const cat = (r.category || r.kind || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return name.includes(q) || idOrSlug.includes(q) || cat.includes(q) || desc.includes(q);
    });
  }

  if (state.statusFilter !== 'all') {
    records = records.filter(r => r.status === state.statusFilter);
  }

  // Sort
  records.sort((a, b) => {
    let valA = a[state.sortField] || a.id || a.slug || '';
    let valB = b[state.sortField] || b.id || b.slug || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return state.sortAsc ? -1 : 1;
    if (valA > valB) return state.sortAsc ? 1 : -1;
    return 0;
  });

  return records;
}

// Render Table
function renderTable() {
  const records = getFilteredRecords();
  recordCountText.textContent = `${records.length} of ${getRecords().length} records`;

  tableBody.innerHTML = '';
  if (records.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  records.forEach(r => {
    const tr = document.createElement('tr');
    const isProduct = state.collection === 'products';
    const idOrSlug = isProduct ? r.id : r.slug;
    const catOrKind = isProduct ? (r.categoryLabel || r.category) : r.kind;
    const thumbUrl = isProduct ? r.image : (r.cover ? r.cover.image : (r.gallery && r.gallery[0] ? r.gallery[0].image : ''));
    const isSuccessStatus = r.status === 'prototype' || r.status === 'berjalan';

    tr.innerHTML = `
      <td>
        ${thumbUrl
          ? `<img src="${thumbUrl}" class="pb-thumb" alt="${r.name}" onerror="this.onerror=null;this.src='';this.className='pb-thumb-placeholder';">`
          : `<div class="pb-thumb-placeholder">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>`
        }
      </td>
      <td>
        <div class="pb-table-title">${r.name}</div>
      </td>
      <td><span style="color:#475569;">${catOrKind || '-'}</span></td>
      <td>
        <span class="pb-chip ${isSuccessStatus ? 'active' : 'muted'}">
          <span class="pb-chip-dot"></span>
          ${r.status}
        </span>
      </td>
      <td><span class="pb-code">${idOrSlug}</span></td>
      <td>
        <div class="pb-row-actions">
          <button class="pb-icon-btn btn-edit" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button class="pb-icon-btn btn-duplicate" title="Duplicate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="pb-icon-btn btn-delete" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    // Row click opens editor
    tr.onclick = (e) => {
      if (e.target.closest('.pb-row-actions')) return;
      openDrawer(r);
    };

    tr.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openDrawer(r);
    };

    tr.querySelector('.btn-duplicate').onclick = (e) => {
      e.stopPropagation();
      duplicateRecord(r);
    };

    tr.querySelector('.btn-delete').onclick = (e) => {
      e.stopPropagation();
      deleteRecord(r);
    };

    tableBody.appendChild(tr);
  });
}

// Drawer: Open / Close / Form Building
function openDrawer(record = null) {
  const isProduct = state.collection === 'products';
  state.isEditing = !!record;
  state.isDirty = false;

  if (record) {
    state.activeRecord = JSON.parse(JSON.stringify(record));
  } else {
    state.activeRecord = isProduct
      ? {
          id: '',
          name: '',
          description: '',
          image: '',
          category: 'akuakultur',
          categoryLabel: CATEGORIES['akuakultur'] || 'Akuakultur',
          icon: 'fish',
          status: 'riset'
        }
      : {
          slug: '',
          number: String(state.projects.length + 1).padStart(2, '0'),
          name: '',
          kind: 'Proyek lapangan',
          status: 'berjalan',
          description: '',
          photoNote: '',
          cover: null,
          gallery: [],
          partners: []
        };
  }

  drawerTitle.textContent = record ? `Edit ${isProduct ? 'Product' : 'Project'}: ${record.name}` : `New ${isProduct ? 'Product' : 'Project'}`;
  drawerBtnDelete.style.display = record ? 'inline-flex' : 'none';

  buildDrawerForm();
  drawerBackdrop.classList.add('open');
  recordDrawer.classList.add('open');
}

function closeDrawer(force = false) {
  if (!force && state.isDirty) {
    if (!confirm('You have unsaved changes. Discard them?')) return;
  }
  drawerBackdrop.classList.remove('open');
  recordDrawer.classList.remove('open');
  state.activeRecord = null;
  state.isDirty = false;
}

function buildDrawerForm() {
  const isProduct = state.collection === 'products';
  const r = state.activeRecord || {};

  if (isProduct) {
    drawerForm.innerHTML = `
      <div class="pb-form-group">
        <label for="f-name">Name *</label>
        <input type="text" id="f-name" class="pb-input" value="${r.name || ''}" placeholder="Product name" required>
      </div>

      <div class="pb-form-group">
        <label for="f-id">ID / Slug *</label>
        <input type="text" id="f-id" class="pb-input mono" value="${r.id || ''}" placeholder="e.g. ikan-nila" required ${state.isEditing ? 'readonly' : ''}>
        <div class="pb-help">Unique identifier, kebab-case. Used in URLs and asset lookups.</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="pb-form-group">
          <label for="f-category">Category *</label>
          <select id="f-category" class="pb-select">
            ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${r.category === k ? 'selected' : ''}>${v} (${k})</option>`).join('')}
          </select>
        </div>

        <div class="pb-form-group">
          <label for="f-status">Status *</label>
          <select id="f-status" class="pb-select">
            <option value="prototype" ${r.status === 'prototype' ? 'selected' : ''}>Prototype</option>
            <option value="riset" ${r.status === 'riset' ? 'selected' : ''}>Riset (Dalam eksplorasi)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="pb-form-group">
          <label for="f-category-label">Category Label</label>
          <input type="text" id="f-category-label" class="pb-input" value="${r.categoryLabel || CATEGORIES[r.category || 'akuakultur'] || ''}">
        </div>

        <div class="pb-form-group">
          <label for="f-icon">Icon</label>
          <select id="f-icon" class="pb-select">
            ${ICONS.map(ic => `<option value="${ic}" ${r.icon === ic ? 'selected' : ''}>${ic}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="pb-form-group">
        <label for="f-description">Description *</label>
        <textarea id="f-description" class="pb-textarea" placeholder="Product overview..." required>${r.description || ''}</textarea>
      </div>

      <div class="pb-form-group">
        <label for="f-image">Product Image URL / Path *</label>
        <input type="text" id="f-image" class="pb-input mono" value="${r.image || ''}" placeholder="/assets/products/example.webp" required>
        <div class="pb-help">Enter static asset path or upload a new file below.</div>
        <div class="pb-dropzone" id="dropzone-product" style="margin-top: 8px;">
          <div class="pb-dropzone-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <div><strong>Choose a file</strong> or drag & drop it here</div>
            <div style="font-size:11px;">Supports WebP, PNG, JPG, SVG</div>
          </div>
          <input type="file" id="file-product" accept="image/*" style="display:none;">
        </div>
        <div id="product-image-preview">
          ${r.image ? renderImagePreview(r.image) : ''}
        </div>
      </div>
    `;

    // Bind auto-slug generator if new record
    if (!state.isEditing) {
      let slugManuallyEdited = false;
      const nameInput = document.getElementById('f-name');
      const idInput = document.getElementById('f-id');
      idInput.addEventListener('input', () => {
        slugManuallyEdited = true;
      });
      nameInput.addEventListener('input', () => {
        if (!slugManuallyEdited) {
          idInput.value = slugify(nameInput.value);
          idInput.classList.remove('pb-input-error');
        }
      });
    }

    const catSelect = document.getElementById('f-category');
    const catLabelInput = document.getElementById('f-category-label');
    catSelect.addEventListener('change', () => {
      catLabelInput.value = CATEGORIES[catSelect.value] || catSelect.value;
      state.isDirty = true;
    });

    const imageInput = document.getElementById('f-image');
    imageInput.addEventListener('input', () => {
      const val = imageInput.value.trim();
      if (state.activeRecord) state.activeRecord.image = val;
      document.getElementById('product-image-preview').innerHTML = val ? renderImagePreview(val) : '';
      imageInput.classList.remove('pb-input-error');
      state.isDirty = true;
    });

    setupDropzone('dropzone-product', 'file-product', 'products', (url) => {
      if (state.activeRecord) state.activeRecord.image = url;
      const imgInput = document.getElementById('f-image');
      if (imgInput) {
        imgInput.value = url;
        imgInput.classList.remove('pb-input-error');
      }
      document.getElementById('product-image-preview').innerHTML = renderImagePreview(url);
      state.isDirty = true;
      showToast('Image uploaded successfully');
    });

  } else {
    // Projects Form
    r.gallery = r.gallery || [];
    drawerForm.innerHTML = `
      <div class="pb-form-group">
        <label for="f-name">Project Name *</label>
        <input type="text" id="f-name" class="pb-input" value="${r.name || ''}" placeholder="Project name" required>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
        <div class="pb-form-group">
          <label for="f-slug">Slug *</label>
          <input type="text" id="f-slug" class="pb-input mono" value="${r.slug || ''}" placeholder="e.g. sensor-ph-air" required ${state.isEditing ? 'readonly' : ''}>
          <div class="pb-help">Kebab-case url identifier.</div>
        </div>

        <div class="pb-form-group">
          <label for="f-number">Number *</label>
          <input type="text" id="f-number" class="pb-input mono" value="${r.number || '01'}" placeholder="01" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="pb-form-group">
          <label for="f-kind">Kind / Category *</label>
          <input type="text" id="f-kind" class="pb-input" value="${r.kind || 'Proyek lapangan'}" placeholder="e.g. Proyek lapangan" required>
        </div>

        <div class="pb-form-group">
          <label for="f-status">Status *</label>
          <select id="f-status" class="pb-select">
            <option value="berjalan" ${r.status === 'berjalan' ? 'selected' : ''}>Berjalan</option>
            <option value="selesai" ${r.status === 'selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </div>
      </div>

      <div class="pb-form-group">
        <label for="f-description">Description *</label>
        <textarea id="f-description" class="pb-textarea" placeholder="Detailed project description..." required>${r.description || ''}</textarea>
      </div>

      <div class="pb-form-group">
        <label for="f-photo-note">Photo Note</label>
        <input type="text" id="f-photo-note" class="pb-input" value="${r.photoNote || ''}" placeholder="Note about photos in album">
      </div>

      <div class="pb-form-group">
        <label>Project Gallery & Media</label>
        <div class="pb-dropzone" id="dropzone-project">
          <div class="pb-dropzone-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <div><strong>Upload photo to gallery</strong></div>
            <div style="font-size:11px;">Drag & drop or choose files to add to gallery</div>
          </div>
          <input type="file" id="file-project" accept="image/*" multiple style="display:none;">
        </div>

        <div class="pb-gallery-grid" id="project-gallery-grid">
          <!-- Gallery photos -->
        </div>
      </div>
    `;

    if (!state.isEditing) {
      let slugManuallyEdited = false;
      const nameInput = document.getElementById('f-name');
      const slugInput = document.getElementById('f-slug');
      slugInput.addEventListener('input', () => {
        slugManuallyEdited = true;
      });
      nameInput.addEventListener('input', () => {
        if (!slugManuallyEdited) {
          slugInput.value = slugify(nameInput.value);
          slugInput.classList.remove('pb-input-error');
        }
      });
    }

    renderProjectGallery();

    setupDropzone('dropzone-project', 'file-project', 'projects', (url, filename) => {
      if (!state.activeRecord) return;
      const newPhoto = {
        title: formatPhotoTitle(filename),
        image: url,
        alt: formatPhotoTitle(filename),
      };
      if (!state.activeRecord.cover) {
        state.activeRecord.cover = newPhoto;
      }
      state.activeRecord.gallery = state.activeRecord.gallery || [];
      state.activeRecord.gallery.push(newPhoto);
      renderProjectGallery();
      state.isDirty = true;
      showToast('Photo added to gallery');
    });
  }

  // Mark dirty and clear error highlights on user input
  drawerForm.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('pb-input-error');
      state.isDirty = true;
    });
    el.addEventListener('change', () => {
      el.classList.remove('pb-input-error');
      state.isDirty = true;
    });
  });
}

function renderImagePreview(url) {
  return `
    <div class="pb-image-preview-box">
      <img src="${url}" class="pb-image-preview-thumb" alt="Preview">
      <div class="pb-image-preview-info">
        <div class="pb-image-preview-path">${url}</div>
      </div>
      <button type="button" class="pb-btn pb-btn-danger" style="padding: 4px 8px; font-size:12px;" onclick="window.clearProductImage()">Clear</button>
    </div>
  `;
}

window.clearProductImage = () => {
  if (state.activeRecord) state.activeRecord.image = '';
  const imgInput = document.getElementById('f-image');
  if (imgInput) imgInput.value = '';
  document.getElementById('product-image-preview').innerHTML = '';
  state.isDirty = true;
};

function renderProjectGallery() {
  const container = document.getElementById('project-gallery-grid');
  if (!container) return;
  const r = state.activeRecord;
  if (!r || !r.gallery || r.gallery.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; padding: 12px; color: #64748b; font-size: 13px;">No photos in gallery yet.</div>';
    return;
  }

  container.innerHTML = r.gallery.map((photo, idx) => {
    const isCover = r.cover && r.cover.image === photo.image;
    return `
      <div class="pb-gallery-card">
        <img src="${photo.image}" class="pb-gallery-img" alt="${photo.alt || photo.title}">
        <div class="pb-gallery-fields">
          <input type="text" placeholder="Title" value="${photo.title || ''}" onchange="window.updateGalleryPhoto(${idx}, 'title', this.value)">
          <input type="text" placeholder="Alt text" value="${photo.alt || ''}" onchange="window.updateGalleryPhoto(${idx}, 'alt', this.value)">
        </div>
        <div class="pb-gallery-card-actions">
          <button type="button" class="pb-btn ${isCover ? 'pb-btn-primary' : 'pb-btn-secondary'}" style="padding:3px 8px; font-size:11px;" onclick="window.setAsCover(${idx})">
            ${isCover ? 'Cover photo' : 'Set as cover'}
          </button>
          <button type="button" class="pb-icon-btn" style="color:#ef4444;" onclick="window.deleteGalleryPhoto(${idx})" title="Remove photo">&times;</button>
        </div>
      </div>
    `;
  }).join('');
}

window.updateGalleryPhoto = (idx, field, val) => {
  if (state.activeRecord && state.activeRecord.gallery[idx]) {
    state.activeRecord.gallery[idx][field] = val;
    if (state.activeRecord.cover && state.activeRecord.cover.image === state.activeRecord.gallery[idx].image) {
      state.activeRecord.cover[field] = val;
    }
    state.isDirty = true;
  }
};

window.setAsCover = (idx) => {
  if (state.activeRecord && state.activeRecord.gallery[idx]) {
    state.activeRecord.cover = { ...state.activeRecord.gallery[idx] };
    renderProjectGallery();
    state.isDirty = true;
    showToast('Cover photo set');
  }
};

window.deleteGalleryPhoto = (idx) => {
  if (state.activeRecord && state.activeRecord.gallery) {
    const deleted = state.activeRecord.gallery.splice(idx, 1)[0];
    if (state.activeRecord.cover && deleted && state.activeRecord.cover.image === deleted.image) {
      state.activeRecord.cover = state.activeRecord.gallery[0] || null;
    }
    renderProjectGallery();
    state.isDirty = true;
  }
};

// Dropzone file handling
function setupDropzone(dropzoneId, inputId, folder, onUploadSuccess) {
  const dropzone = document.getElementById(dropzoneId);
  const input = document.getElementById(inputId);
  if (!dropzone || !input) return;

  dropzone.onclick = () => input.click();

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) uploadFiles(files, folder, onUploadSuccess);
  });

  input.addEventListener('change', () => {
    if (input.files.length) uploadFiles(input.files, folder, onUploadSuccess);
  });
}

async function uploadFiles(files, folder, onUploadSuccess) {
  for (const file of Array.from(files)) {
    try {
      showToast(`Uploading ${file.name}...`);
      const url = `/api/upload?folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(file.name)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUploadSuccess(data.url, file.name);
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error');
    }
  }
}

function markFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('pb-input-error');
}

function clearFieldErrors() {
  drawerForm.querySelectorAll('.pb-input-error').forEach(el => el.classList.remove('pb-input-error'));
}

// Saving Record
async function saveRecord() {
  const isProduct = state.collection === 'products';
  clearFieldErrors();
  saveSpinner.style.display = 'inline-block';
  drawerBtnSave.disabled = true;

  try {
    let updatedPayload;
    if (isProduct) {
      const id = document.getElementById('f-id').value.trim();
      const name = document.getElementById('f-name').value.trim();
      const category = document.getElementById('f-category').value;
      const categoryLabel = document.getElementById('f-category-label').value.trim();
      const status = document.getElementById('f-status').value;
      const icon = document.getElementById('f-icon').value;
      const description = document.getElementById('f-description').value.trim();
      const image = (document.getElementById('f-image')?.value.trim()) || (state.activeRecord && state.activeRecord.image) || '';

      const missing = [];
      if (!name) { missing.push('Name'); markFieldError('f-name'); }
      if (!id) { missing.push('ID / Slug'); markFieldError('f-id'); }
      if (!description) { missing.push('Description'); markFieldError('f-description'); }
      if (!image) { missing.push('Product Image'); markFieldError('f-image'); }

      if (missing.length) {
        throw new Error(`Please fill all required fields: ${missing.join(', ')}.`);
      }

      const productObj = { id, name, description, image, category, categoryLabel, icon, status };
      const currentList = [...state.products];

      if (state.isEditing) {
        const idx = currentList.findIndex(p => p.id === state.activeRecord.id);
        if (idx !== -1) currentList[idx] = productObj;
      } else {
        if (currentList.some(p => p.id === id)) {
          throw new Error(`Product with ID "${id}" already exists.`);
        }
        currentList.push(productObj);
      }
      updatedPayload = currentList;

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      state.products = updatedPayload;
    } else {
      // Projects
      const slug = document.getElementById('f-slug').value.trim();
      const number = document.getElementById('f-number').value.trim();
      const name = document.getElementById('f-name').value.trim();
      const kind = document.getElementById('f-kind').value.trim();
      const status = document.getElementById('f-status').value;
      const description = document.getElementById('f-description').value.trim();
      const photoNote = document.getElementById('f-photo-note').value.trim();
      const gallery = (state.activeRecord && state.activeRecord.gallery) || [];
      const cover = (state.activeRecord && state.activeRecord.cover) || (gallery[0] || null);
      const partners = (state.activeRecord && state.activeRecord.partners) || undefined;

      const missing = [];
      if (!name) { missing.push('Project Name'); markFieldError('f-name'); }
      if (!slug) { missing.push('Slug'); markFieldError('f-slug'); }
      if (!number) { missing.push('Number'); markFieldError('f-number'); }
      if (!kind) { missing.push('Kind'); markFieldError('f-kind'); }
      if (!description) { missing.push('Description'); markFieldError('f-description'); }

      if (missing.length) {
        throw new Error(`Please fill all required fields: ${missing.join(', ')}.`);
      }

      const projectObj = { slug, number, status, kind, name, description, cover, gallery, photoNote };
      if (partners) projectObj.partners = partners;

      const currentList = [...state.projects];
      if (state.isEditing) {
        const idx = currentList.findIndex(p => p.slug === state.activeRecord.slug);
        if (idx !== -1) currentList[idx] = projectObj;
      } else {
        if (currentList.some(p => p.slug === slug)) {
          throw new Error(`Project with slug "${slug}" already exists.`);
        }
        currentList.push(projectObj);
      }
      updatedPayload = currentList;

      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project');

      state.projects = updatedPayload;
    }

    updateCounts();
    renderTable();
    closeDrawer(true);
    showToast(state.isEditing ? 'Changes saved successfully' : 'Record created successfully');
  } catch (err) {
    showToast(err.message, 'error', 5000);
  } finally {
    saveSpinner.style.display = 'none';
    drawerBtnSave.disabled = false;
  }
}

// Delete Record
async function deleteRecord(record = null) {
  const target = record || state.activeRecord;
  if (!target) return;

  const isProduct = state.collection === 'products';
  const name = target.name;
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    let updatedPayload;
    if (isProduct) {
      updatedPayload = state.products.filter(p => p.id !== target.id);
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      state.products = updatedPayload;
    } else {
      updatedPayload = state.projects.filter(p => p.slug !== target.slug);
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      state.projects = updatedPayload;
    }

    updateCounts();
    renderTable();
    closeDrawer(true);
    showToast(`"${name}" deleted successfully`);
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  }
}

// Duplicate Record
function duplicateRecord(record) {
  const copy = JSON.parse(JSON.stringify(record));
  const isProduct = state.collection === 'products';
  if (isProduct) {
    copy.id = `${copy.id}-copy`;
    copy.name = `${copy.name} (Copy)`;
  } else {
    copy.slug = `${copy.slug}-copy`;
    copy.name = `${copy.name} (Copy)`;
    copy.number = `${parseInt(copy.number || '0', 10) + 1}`.padStart(2, '0');
  }
  openDrawer(copy);
  state.isEditing = false;
  state.isDirty = true;
}

// Helper: Slugify
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPhotoTitle(filename) {
  const base = filename.replace(/\.[^/.]+$/, '');
  return base.replace(/[-_]+/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

// Event Listeners
navProducts.onclick = () => switchCollection('products');
navProjects.onclick = () => switchCollection('projects');

btnNewRecord.onclick = () => openDrawer(null);
drawerClose.onclick = () => closeDrawer();
drawerBtnCancel.onclick = () => closeDrawer();
drawerBackdrop.onclick = () => closeDrawer();
drawerBtnSave.onclick = saveRecord;
drawerBtnDelete.onclick = () => deleteRecord();

// Table Sorting
document.querySelectorAll('th.sortable').forEach(th => {
  th.onclick = () => {
    const field = th.dataset.sort;
    if (state.sortField === field) {
      state.sortAsc = !state.sortAsc;
    } else {
      state.sortField = field;
      state.sortAsc = true;
    }
    renderTable();
  };
});

// Search and Status Filters
searchInput.oninput = (e) => {
  state.search = e.target.value;
  searchClear.style.display = state.search ? 'block' : 'none';
  renderTable();
};

searchClear.onclick = () => {
  searchInput.value = '';
  state.search = '';
  searchClear.style.display = 'none';
  renderTable();
};

filterStatus.onchange = (e) => {
  state.statusFilter = e.target.value;
  renderTable();
};

// Logs Drawer
btnOpenLogs.onclick = () => {
  logsBackdrop.classList.add('open');
  logsDrawer.classList.add('open');
};

logsClose.onclick = () => {
  logsBackdrop.classList.remove('open');
  logsDrawer.classList.remove('open');
};

logsBackdrop.onclick = () => {
  logsBackdrop.classList.remove('open');
  logsDrawer.classList.remove('open');
};

btnRunBuild.onclick = async () => {
  btnRunBuild.disabled = true;
  btnRunBuild.textContent = 'Building...';
  logsPre.textContent = 'Executing `npm run build`...\n';
  try {
    const res = await fetch('/api/build', { method: 'POST' });
    const data = await res.json();
    logsPre.textContent = data.output || (data.success ? 'Build succeeded with no output' : 'Build failed');
    if (data.success) {
      showToast('Build and prerender completed successfully');
    } else {
      showToast('Build failed. See logs for details.', 'error');
    }
  } catch (err) {
    logsPre.textContent += '\nError: ' + err.message;
    showToast('Failed to trigger build: ' + err.message, 'error');
  } finally {
    btnRunBuild.disabled = false;
    btnRunBuild.textContent = 'Trigger Build';
  }
};

// Keyboard Shortcuts (Esc closes drawers)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (logsDrawer.classList.contains('open')) {
      logsClose.click();
    } else if (recordDrawer.classList.contains('open')) {
      closeDrawer();
    }
  }
});

// Init
loadData();
