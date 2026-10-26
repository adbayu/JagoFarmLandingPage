// JagoFarm CMS - PocketBase-Style Interactive Script with Dynamic Collection Builder
const state = {
  collection: 'products',
  collections: [],
  data: {},
  products: [],
  projects: [],
  search: '',
  statusFilter: 'all',
  sortField: 'name',
  sortAsc: true,
  activeRecord: null,
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

// DOM Elements
const collectionsList = document.getElementById('collections-list');
const btnAddCollection = document.getElementById('btn-add-collection');
const btnDeleteCollection = document.getElementById('btn-delete-collection');
const pageTitle = document.getElementById('page-title');
const recordCountText = document.getElementById('record-count-text');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const filterStatus = document.getElementById('filter-status');
const btnNewRecord = document.getElementById('btn-new-record');
const dataTable = document.getElementById('data-table');
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
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const themeToggleLabel = document.getElementById('theme-toggle-label');
const btnOpenLogs = document.getElementById('btn-open-logs');
const logsBackdrop = document.getElementById('logs-backdrop');
const logsDrawer = document.getElementById('logs-drawer');
const logsClose = document.getElementById('logs-close');
const btnRunBuild = document.getElementById('btn-run-build');
const logsPre = document.getElementById('logs-pre');

// Modal Elements
const modalCollection = document.getElementById('modal-collection');
const modalCollectionClose = document.getElementById('modal-collection-close');
const btnCancelCollection = document.getElementById('btn-cancel-collection');
const btnSubmitCollection = document.getElementById('btn-submit-collection');
const colTitleInput = document.getElementById('col-title');
const colNameInput = document.getElementById('col-name');
const fieldsBuilderList = document.getElementById('fields-builder-list');
const btnBuilderAddField = document.getElementById('btn-builder-add-field');

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

// Helpers
function getActiveCollectionDef() {
  return state.collections.find(c => c.name === state.collection) || null;
}

function getRecords() {
  if (state.collection === 'products') return state.products;
  if (state.collection === 'projects') return state.projects;
  return state.data[state.collection] || [];
}

function setRecords(newRecords) {
  if (state.collection === 'products') {
    state.products = newRecords;
  } else if (state.collection === 'projects') {
    state.projects = newRecords;
  }
  state.data[state.collection] = newRecords;
}

// Data Fetching
async function loadData() {
  try {
    const resCols = await fetch('/api/collections');
    state.collections = await resCols.json();

    // Load data for all collections
    await Promise.all(state.collections.map(async (c) => {
      try {
        const res = await fetch(`/api/${c.name}`);
        const items = await res.json();
        state.data[c.name] = items;
        if (c.name === 'products') state.products = items;
        if (c.name === 'projects') state.projects = items;
      } catch {
        state.data[c.name] = [];
      }
    }));

    if (!state.collections.some(c => c.name === state.collection)) {
      state.collection = state.collections[0]?.name || 'products';
    }

    renderSidebarCollections();
    updateCollectionUI();
  } catch (err) {
    showToast('Failed to load collections: ' + err.message, 'error');
  }
}

function renderSidebarCollections() {
  if (!collectionsList) return;
  collectionsList.innerHTML = '';

  state.collections.forEach(c => {
    const btn = document.createElement('button');
    btn.className = `pb-nav-item ${state.collection === c.name ? 'active' : ''}`;
    btn.dataset.collection = c.name;
    btn.id = `nav-${c.name}`;

    let iconSvg = '';
    if (c.name === 'products') {
      iconSvg = `
        <svg class="pb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      `;
    } else if (c.name === 'projects') {
      iconSvg = `
        <svg class="pb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg class="pb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      `;
    }

    const count = (state.data[c.name] || []).length;
    btn.innerHTML = `
      ${iconSvg}
      <span class="pb-nav-label">${c.title || c.name}</span>
      <span class="pb-count-badge" id="count-${c.name}">${count}</span>
    `;

    btn.onclick = () => switchCollection(c.name);
    collectionsList.appendChild(btn);
  });
}

function updateCounts() {
  state.collections.forEach(c => {
    const el = document.getElementById(`count-${c.name}`);
    if (el) el.textContent = (state.data[c.name] || []).length;
  });
}

function updateCollectionUI() {
  const colDef = getActiveCollectionDef();
  if (colDef) {
    pageTitle.textContent = colDef.title || colDef.name;
    if (btnDeleteCollection) {
      btnDeleteCollection.style.display = colDef.system ? 'none' : 'inline-flex';
    }
  }

  // Update active class in sidebar
  document.querySelectorAll('.pb-collections-list .pb-nav-item').forEach(btn => {
    if (btn.dataset.collection === state.collection) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  populateStatusFilter();
  renderTable();
}

function populateStatusFilter() {
  filterStatus.innerHTML = '<option value="all">All statuses</option>';
  if (state.collection === 'products') {
    filterStatus.style.display = 'inline-block';
    filterStatus.innerHTML += `
      <option value="prototype">Prototype</option>
      <option value="riset">Dalam eksplorasi (riset)</option>
    `;
  } else if (state.collection === 'projects') {
    filterStatus.style.display = 'inline-block';
    filterStatus.innerHTML += `
      <option value="berjalan">Berjalan</option>
      <option value="selesai">Selesai</option>
    `;
  } else {
    // Custom collection: check if has status field
    const colDef = getActiveCollectionDef();
    const statusField = colDef?.fields?.find(f => f.name === 'status' && f.type === 'select');
    if (statusField && statusField.options) {
      filterStatus.style.display = 'inline-block';
      statusField.options.forEach(opt => {
        filterStatus.innerHTML += `<option value="${opt}">${opt}</option>`;
      });
    } else {
      filterStatus.style.display = 'none';
    }
  }
  filterStatus.value = state.statusFilter;
}

// Switching Collections
async function switchCollection(col) {
  if (state.collection === col) return;
  state.collection = col;
  state.search = '';
  searchInput.value = '';
  searchClear.style.display = 'none';
  state.statusFilter = 'all';

  if (!state.data[col]) {
    try {
      const res = await fetch(`/api/${col}`);
      state.data[col] = await res.json();
    } catch {
      state.data[col] = [];
    }
  }

  updateCollectionUI();
}

// Filtering and Sorting
function getFilteredRecords() {
  let records = [...getRecords()];
  const q = state.search.trim().toLowerCase();

  if (q) {
    records = records.filter(r => {
      return Object.values(r).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return String(val).includes(q);
        return false;
      });
    });
  }

  if (state.statusFilter !== 'all') {
    records = records.filter(r => r.status === state.statusFilter);
  }

  // Sort
  records.sort((a, b) => {
    let valA = a[state.sortField] ?? a.name ?? a.id ?? a.slug ?? '';
    let valB = b[state.sortField] ?? b.name ?? b.id ?? b.slug ?? '';
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

  const colDef = getActiveCollectionDef();
  const thead = dataTable.querySelector('thead');

  if (state.collection === 'products') {
    thead.innerHTML = `
      <tr>
        <th style="width: 60px;">Thumb</th>
        <th class="sortable" data-sort="name">Name</th>
        <th class="sortable" data-sort="category">Category / Kind</th>
        <th class="sortable" data-sort="status">Status</th>
        <th class="sortable" data-sort="id">ID / Slug</th>
        <th style="width: 100px; text-align: right;">Actions</th>
      </tr>
    `;
  } else if (state.collection === 'projects') {
    thead.innerHTML = `
      <tr>
        <th style="width: 60px;">Thumb</th>
        <th class="sortable" data-sort="name">Name</th>
        <th class="sortable" data-sort="kind">Category / Kind</th>
        <th class="sortable" data-sort="status">Status</th>
        <th class="sortable" data-sort="slug">ID / Slug</th>
        <th style="width: 100px; text-align: right;">Actions</th>
      </tr>
    `;
  } else {
    // Custom Collection Table Headers (derived from first 4 fields)
    const displayFields = (colDef?.fields || []).slice(0, 4);
    thead.innerHTML = `
      <tr>
        ${displayFields.map(f => `<th class="sortable" data-sort="${f.name}">${f.label || f.name}</th>`).join('')}
        <th style="width: 100px; text-align: right;">Actions</th>
      </tr>
    `;
  }

  // Bind sortable headers
  thead.querySelectorAll('th.sortable').forEach(th => {
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

  tableBody.innerHTML = '';
  if (records.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  records.forEach((r, idx) => {
    const tr = document.createElement('tr');

    if (state.collection === 'products') {
      const isSuccessStatus = r.status === 'prototype';
      tr.innerHTML = `
        <td>
          ${r.image
            ? `<img src="${r.image}" class="pb-thumb" alt="${r.name}" onerror="this.onerror=null;this.src='';this.className='pb-thumb-placeholder';">`
            : `<div class="pb-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
          }
        </td>
        <td><div class="pb-table-title">${r.name}</div></td>
        <td><span style="color:var(--pb-text-secondary);">${r.categoryLabel || r.category || '-'}</span></td>
        <td>
          <span class="pb-chip ${isSuccessStatus ? 'active' : 'muted'}">
            <span class="pb-chip-dot"></span>
            ${r.status}
          </span>
        </td>
        <td><span class="pb-code">${r.id}</span></td>
        <td>${renderRowActionButtons(r, idx)}</td>
      `;
    } else if (state.collection === 'projects') {
      const thumbUrl = r.cover ? r.cover.image : (r.gallery && r.gallery[0] ? r.gallery[0].image : '');
      const isSuccessStatus = r.status === 'berjalan';
      tr.innerHTML = `
        <td>
          ${thumbUrl
            ? `<img src="${thumbUrl}" class="pb-thumb" alt="${r.name}" onerror="this.onerror=null;this.src='';this.className='pb-thumb-placeholder';">`
            : `<div class="pb-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
          }
        </td>
        <td><div class="pb-table-title">${r.name}</div></td>
        <td><span style="color:var(--pb-text-secondary);">${r.kind || '-'}</span></td>
        <td>
          <span class="pb-chip ${isSuccessStatus ? 'active' : 'muted'}">
            <span class="pb-chip-dot"></span>
            ${r.status}
          </span>
        </td>
        <td><span class="pb-code">${r.slug}</span></td>
        <td>${renderRowActionButtons(r, idx)}</td>
      `;
    } else {
      // Custom Collection Row
      const displayFields = (colDef?.fields || []).slice(0, 4);
      let cellsHtml = '';
      displayFields.forEach(f => {
        const val = r[f.name];
        if (f.type === 'file') {
          cellsHtml += `
            <td>
              ${val
                ? `<img src="${val}" class="pb-thumb" alt="File" onerror="this.onerror=null;this.src='';this.className='pb-thumb-placeholder';">`
                : `<div class="pb-thumb-placeholder">-</div>`
              }
            </td>
          `;
        } else if (f.type === 'bool') {
          cellsHtml += `
            <td>
              <span class="pb-chip ${val ? 'active' : 'muted'}">
                <span class="pb-chip-dot"></span>
                ${val ? 'Yes' : 'No'}
              </span>
            </td>
          `;
        } else if (f.name === 'id' || f.name === 'slug') {
          cellsHtml += `<td><span class="pb-code">${val ?? '-'}</span></td>`;
        } else {
          cellsHtml += `<td><span style="color:var(--pb-text);">${val !== undefined && val !== null ? String(val) : '-'}</span></td>`;
        }
      });
      cellsHtml += `<td>${renderRowActionButtons(r, idx)}</td>`;
      tr.innerHTML = cellsHtml;
    }

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

function renderRowActionButtons(r, idx) {
  return `
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
  `;
}

// Drawer: Open / Close / Form Building
function openDrawer(record = null) {
  const colDef = getActiveCollectionDef();
  const colTitle = colDef?.title || colDef?.name || state.collection;
  state.isEditing = !!record;
  state.isDirty = false;

  if (record) {
    state.activeRecord = JSON.parse(JSON.stringify(record));
  } else {
    if (state.collection === 'products') {
      state.activeRecord = {
        id: '',
        name: '',
        description: '',
        image: '',
        category: 'akuakultur',
        categoryLabel: CATEGORIES['akuakultur'] || 'Akuakultur',
        icon: 'fish',
        status: 'riset'
      };
    } else if (state.collection === 'projects') {
      state.activeRecord = {
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
    } else {
      // Custom Collection default record
      const def = {};
      (colDef?.fields || []).forEach(f => {
        def[f.name] = f.type === 'bool' ? false : (f.type === 'number' ? 0 : '');
      });
      state.activeRecord = def;
    }
  }

  const recName = record?.name || record?.title || record?.id || record?.slug || '';
  drawerTitle.textContent = record ? `Edit ${colTitle}: ${recName}` : `New ${colTitle}`;
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
  const r = state.activeRecord || {};

  if (state.collection === 'products') {
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

    if (!state.isEditing) {
      const nameInput = document.getElementById('f-name');
      const idInput = document.getElementById('f-id');
      nameInput.addEventListener('input', () => {
        if (!state.isDirty) {
          idInput.value = slugify(nameInput.value);
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
      r.image = imageInput.value.trim();
      document.getElementById('product-image-preview').innerHTML = r.image ? renderImagePreview(r.image) : '';
      state.isDirty = true;
    });

    setupDropzone('dropzone-product', 'file-product', 'products', (url) => {
      r.image = url;
      imageInput.value = url;
      document.getElementById('product-image-preview').innerHTML = renderImagePreview(url);
      state.isDirty = true;
      showToast('Image uploaded successfully');
    });

  } else if (state.collection === 'projects') {
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
      const nameInput = document.getElementById('f-name');
      const slugInput = document.getElementById('f-slug');
      nameInput.addEventListener('input', () => {
        if (!state.isDirty) {
          slugInput.value = slugify(nameInput.value);
        }
      });
    }

    renderProjectGallery();

    setupDropzone('dropzone-project', 'file-project', 'projects', (url, filename) => {
      const newPhoto = {
        title: formatPhotoTitle(filename),
        image: url,
        alt: formatPhotoTitle(filename),
      };
      if (!r.cover) {
        r.cover = newPhoto;
      }
      r.gallery.push(newPhoto);
      renderProjectGallery();
      state.isDirty = true;
      showToast('Photo added to gallery');
    });

  } else {
    // Custom Collection Dynamic Form
    const colDef = getActiveCollectionDef();
    let fieldsHtml = '';

    (colDef?.fields || []).forEach(f => {
      const val = r[f.name] ?? '';
      const reqMark = f.required ? ' *' : '';

      if (f.type === 'textarea') {
        fieldsHtml += `
          <div class="pb-form-group">
            <label for="f-${f.name}">${f.label || f.name}${reqMark}</label>
            <textarea id="f-${f.name}" class="pb-textarea" placeholder="${f.label || f.name}..." ${f.required ? 'required' : ''}>${val}</textarea>
          </div>
        `;
      } else if (f.type === 'number') {
        fieldsHtml += `
          <div class="pb-form-group">
            <label for="f-${f.name}">${f.label || f.name}${reqMark}</label>
            <input type="number" id="f-${f.name}" class="pb-input mono" value="${val}" placeholder="0" ${f.required ? 'required' : ''}>
          </div>
        `;
      } else if (f.type === 'select') {
        const opts = Array.isArray(f.options) ? f.options : [];
        fieldsHtml += `
          <div class="pb-form-group">
            <label for="f-${f.name}">${f.label || f.name}${reqMark}</label>
            <select id="f-${f.name}" class="pb-select">
              ${opts.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (f.type === 'bool') {
        fieldsHtml += `
          <div class="pb-form-group" style="flex-direction: row; align-items: center; gap: 8px;">
            <input type="checkbox" id="f-${f.name}" ${val ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
            <label for="f-${f.name}" style="margin: 0; cursor: pointer;">${f.label || f.name}${reqMark}</label>
          </div>
        `;
      } else if (f.type === 'file') {
        fieldsHtml += `
          <div class="pb-form-group">
            <label for="f-${f.name}">${f.label || f.name}${reqMark}</label>
            <input type="text" id="f-${f.name}" class="pb-input mono" value="${val}" placeholder="/assets/${state.collection}/..." ${f.required ? 'required' : ''}>
            <div class="pb-dropzone" id="dropzone-${f.name}" style="margin-top: 8px;">
              <div class="pb-dropzone-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <div><strong>Choose a file</strong> or drag & drop</div>
              </div>
              <input type="file" id="file-${f.name}" accept="image/*" style="display:none;">
            </div>
            <div id="preview-${f.name}">
              ${val ? renderImagePreview(val, f.name) : ''}
            </div>
          </div>
        `;
      } else {
        // default text
        fieldsHtml += `
          <div class="pb-form-group">
            <label for="f-${f.name}">${f.label || f.name}${reqMark}</label>
            <input type="text" id="f-${f.name}" class="pb-input ${f.name === 'id' || f.name === 'slug' ? 'mono' : ''}" value="${val}" placeholder="${f.label || f.name}" ${f.required ? 'required' : ''}>
          </div>
        `;
      }
    });

    drawerForm.innerHTML = fieldsHtml;

    // Setup dynamic file dropzones
    (colDef?.fields || []).forEach(f => {
      if (f.type === 'file') {
        const inputEl = document.getElementById(`f-${f.name}`);
        if (inputEl) {
          inputEl.addEventListener('input', () => {
            const val = inputEl.value.trim();
            r[f.name] = val;
            const previewEl = document.getElementById(`preview-${f.name}`);
            if (previewEl) previewEl.innerHTML = val ? renderImagePreview(val, f.name) : '';
            state.isDirty = true;
          });
        }
        setupDropzone(`dropzone-${f.name}`, `file-${f.name}`, state.collection, (url) => {
          r[f.name] = url;
          if (inputEl) inputEl.value = url;
          const previewEl = document.getElementById(`preview-${f.name}`);
          if (previewEl) previewEl.innerHTML = renderImagePreview(url, f.name);
          state.isDirty = true;
          showToast('File uploaded successfully');
        });
      }
    });
  }

  // Mark dirty on any user input
  drawerForm.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => { state.isDirty = true; });
    el.addEventListener('change', () => { state.isDirty = true; });
  });
}

function renderImagePreview(url, fieldName = 'image') {
  return `
    <div class="pb-image-preview-box">
      <img src="${url}" class="pb-image-preview-thumb" alt="Preview">
      <div class="pb-image-preview-info">
        <div class="pb-image-preview-path">${url}</div>
      </div>
      <button type="button" class="pb-btn pb-btn-danger" style="padding: 4px 8px; font-size:12px;" onclick="window.clearCustomImage('${fieldName}')">Clear</button>
    </div>
  `;
}

window.clearProductImage = () => {
  if (state.activeRecord) state.activeRecord.image = '';
  const input = document.getElementById('f-image');
  if (input) input.value = '';
  const preview = document.getElementById('product-image-preview');
  if (preview) preview.innerHTML = '';
  state.isDirty = true;
};

window.clearCustomImage = (fieldName) => {
  if (state.activeRecord) state.activeRecord[fieldName] = '';
  const input = document.getElementById(`f-${fieldName}`);
  if (input) input.value = '';
  const preview = document.getElementById(`preview-${fieldName}`) || document.getElementById('product-image-preview');
  if (preview) preview.innerHTML = '';
  state.isDirty = true;
};

function renderProjectGallery() {
  const container = document.getElementById('project-gallery-grid');
  if (!container) return;
  const r = state.activeRecord;
  if (!r || !r.gallery || r.gallery.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; padding: 12px; color: var(--pb-muted); font-size: 13px;">No photos in gallery yet.</div>';
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
          <button type="button" class="pb-icon-btn" style="color:var(--pb-danger);" onclick="window.deleteGalleryPhoto(${idx})" title="Remove photo">&times;</button>
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
  clearFieldErrors();
  saveSpinner.style.display = 'inline-block';
  drawerBtnSave.disabled = true;

  try {
    let updatedPayload;
    if (state.collection === 'products') {
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
      state.data.products = updatedPayload;
    } else if (state.collection === 'projects') {
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
      state.data.projects = updatedPayload;
    } else {
      // Custom Collection Saving
      const colDef = getActiveCollectionDef();
      const recordObj = {};
      const missing = [];

      (colDef?.fields || []).forEach(f => {
        const input = document.getElementById(`f-${f.name}`);
        if (!input) return;

        let val;
        if (f.type === 'bool') {
          val = input.checked;
        } else if (f.type === 'number') {
          val = input.value === '' ? null : Number(input.value);
        } else {
          val = input.value.trim();
        }

        if (f.required && (val === '' || val === null || val === undefined)) {
          missing.push(f.label || f.name);
          markFieldError(`f-${f.name}`);
        }
        recordObj[f.name] = val;
      });

      if (missing.length) {
        throw new Error(`Please fill all required fields: ${missing.join(', ')}.`);
      }

      const currentList = [...(state.data[state.collection] || [])];
      if (state.isEditing) {
        const idx = currentList.indexOf(state.activeRecord);
        if (idx !== -1) {
          currentList[idx] = recordObj;
        } else {
          // match by id or slug if exists
          const matchIdx = currentList.findIndex(item => (item.id && item.id === state.activeRecord.id) || (item.slug && item.slug === state.activeRecord.slug));
          if (matchIdx !== -1) currentList[matchIdx] = recordObj;
          else currentList.push(recordObj);
        }
      } else {
        currentList.push(recordObj);
      }

      const res = await fetch(`/api/${state.collection}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentList),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save record');

      state.data[state.collection] = currentList;
      setRecords(currentList);
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

  const colDef = getActiveCollectionDef();
  const name = target.name || target.title || target.id || target.slug || 'record';
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    let updatedPayload;
    if (state.collection === 'products') {
      updatedPayload = state.products.filter(p => p.id !== target.id);
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      state.products = updatedPayload;
      state.data.products = updatedPayload;
    } else if (state.collection === 'projects') {
      updatedPayload = state.projects.filter(p => p.slug !== target.slug);
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      state.projects = updatedPayload;
      state.data.projects = updatedPayload;
    } else {
      const currentList = state.data[state.collection] || [];
      updatedPayload = currentList.filter(item => item !== target);
      const res = await fetch(`/api/${state.collection}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      state.data[state.collection] = updatedPayload;
      setRecords(updatedPayload);
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
  if (state.collection === 'products') {
    copy.id = `${copy.id}-copy`;
    copy.name = `${copy.name} (Copy)`;
  } else if (state.collection === 'projects') {
    copy.slug = `${copy.slug}-copy`;
    copy.name = `${copy.name} (Copy)`;
    copy.number = `${parseInt(copy.number || '0', 10) + 1}`.padStart(2, '0');
  } else {
    if (copy.name) copy.name = `${copy.name} (Copy)`;
    if (copy.title) copy.title = `${copy.title} (Copy)`;
    if (copy.id) copy.id = `${copy.id}-copy`;
    if (copy.slug) copy.slug = `${copy.slug}-copy`;
  }
  openDrawer(copy);
  state.isEditing = false;
  state.isDirty = true;
}

// Collection Builder Modal Handling
function openCollectionModal() {
  colTitleInput.value = '';
  colNameInput.value = '';
  fieldsBuilderList.innerHTML = '';

  // Add default fields: name & description
  addFieldRow('name', 'Name', 'text', true);
  addFieldRow('description', 'Description', 'textarea', true);

  modalCollection.showModal();
}

function closeCollectionModal() {
  modalCollection.close();
}

function addFieldRow(name = '', label = '', type = 'text', required = false) {
  const row = document.createElement('div');
  row.className = 'pb-field-row';
  row.innerHTML = `
    <input type="text" class="pb-input f-name" placeholder="Field name (id)" value="${name}" required>
    <input type="text" class="pb-input f-label" placeholder="Display label" value="${label}" required>
    <select class="pb-select f-type">
      <option value="text" ${type === 'text' ? 'selected' : ''}>Text</option>
      <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>Textarea</option>
      <option value="number" ${type === 'number' ? 'selected' : ''}>Number</option>
      <option value="file" ${type === 'file' ? 'selected' : ''}>File / Image</option>
      <option value="bool" ${type === 'bool' ? 'selected' : ''}>Boolean</option>
    </select>
    <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;">
      <input type="checkbox" class="f-req" ${required ? 'checked' : ''}> Req
    </label>
    <button type="button" class="pb-icon-btn f-remove" style="color:var(--pb-danger);" title="Remove field">&times;</button>
  `;

  row.querySelector('.f-remove').onclick = () => row.remove();
  fieldsBuilderList.appendChild(row);
}

colTitleInput.addEventListener('input', () => {
  colNameInput.value = slugify(colTitleInput.value);
});

btnBuilderAddField.onclick = () => addFieldRow();

btnSubmitCollection.onclick = async () => {
  const title = colTitleInput.value.trim();
  const name = colNameInput.value.trim();

  if (!title || !name) {
    showToast('Collection display name and ID are required', 'error');
    return;
  }

  const fields = [];
  const rows = fieldsBuilderList.querySelectorAll('.pb-field-row');
  for (const row of rows) {
    const fName = row.querySelector('.f-name').value.trim();
    const fLabel = row.querySelector('.f-label').value.trim();
    const fType = row.querySelector('.f-type').value;
    const fReq = row.querySelector('.f-req').checked;

    if (!fName) {
      showToast('All fields must have a valid field name', 'error');
      return;
    }
    fields.push({
      name: slugify(fName),
      label: fLabel || fName,
      type: fType,
      required: fReq,
    });
  }

  try {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, title, fields }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create collection');

    closeCollectionModal();
    showToast(`Collection "${title}" created successfully`);
    await loadData();
    await switchCollection(name);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Delete Collection
if (btnDeleteCollection) {
  btnDeleteCollection.onclick = async () => {
    const colDef = getActiveCollectionDef();
    if (!colDef || colDef.system) return;

    if (!confirm(`Are you sure you want to delete collection "${colDef.title || colDef.name}" and all its records? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/collections/${colDef.name}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete collection');

      showToast(`Collection "${colDef.title || colDef.name}" deleted`);
      state.collection = 'products';
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}

// Modal listeners
if (btnAddCollection) btnAddCollection.onclick = openCollectionModal;
if (modalCollectionClose) modalCollectionClose.onclick = closeCollectionModal;
if (btnCancelCollection) btnCancelCollection.onclick = closeCollectionModal;

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

// Global Event Listeners
btnNewRecord.onclick = () => openDrawer(null);
drawerClose.onclick = () => closeDrawer();
drawerBtnCancel.onclick = () => closeDrawer();
drawerBackdrop.onclick = () => closeDrawer();
drawerBtnSave.onclick = saveRecord;
drawerBtnDelete.onclick = () => deleteRecord();

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

// Keyboard Shortcuts (Esc closes drawers and modals)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalCollection.hasAttribute('open')) {
      closeCollectionModal();
    } else if (logsDrawer.classList.contains('open')) {
      logsClose.click();
    } else if (recordDrawer.classList.contains('open')) {
      closeDrawer();
    }
  }
});

// Theme handling
function updateThemeUI(theme) {
  const isDark = theme === 'dark';
  const moonIcon = btnToggleTheme?.querySelector('.theme-icon-moon');
  const sunIcon = btnToggleTheme?.querySelector('.theme-icon-sun');
  if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'block';
  if (sunIcon) sunIcon.style.display = isDark ? 'block' : 'none';
  if (themeToggleLabel) {
    themeToggleLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem('jagofarm-cms-theme', nextTheme);
  } catch {}
  updateThemeUI(nextTheme);
  showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
}

if (btnToggleTheme) {
  btnToggleTheme.addEventListener('click', toggleTheme);
  updateThemeUI(document.documentElement.dataset.theme || 'light');
}

// Init
loadData();
