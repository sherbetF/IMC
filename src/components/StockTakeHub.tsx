import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  History, 
  DollarSign, 
  Building2, 
  MapPin, 
  Tag, 
  Image as ImageIcon, 
  User, 
  Send, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Layers, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  X,
  Boxes,
  ShieldAlert,
  Syringe,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { StockItem, StockTransaction, StockItemCategory, StockActionType, StockBatch } from '../types';
import { useAuth } from '../context/AuthContext';

// Default initial stock inventory with multi-expiry batch tracking
const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'stk-1',
    name: 'EDTA K2 3ml Vacuum Blood Tube (Lavender)',
    type: 'Blood Collection Tubes',
    indentFrom: 'HSA Central Store Utama',
    currentStock: 450,
    unit: 'pcs',
    pricePerUnit: 0.85,
    locationStored: 'Cabinet A - Shelf 1',
    warningThreshold: 100,
    expiryDate: '2026-09-30',
    batches: [
      { id: 'stk-1-b1', batchNumber: 'LOT-2026-A1', quantity: 150, expiryDate: '2026-09-30', notes: 'First batch' },
      { id: 'stk-1-b2', batchNumber: 'LOT-2027-B2', quantity: 300, expiryDate: '2027-10-15', notes: 'Second batch' }
    ],
    notes: 'Primary tube for FBC & HbA1c tests',
    pictureUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-24T10:30:00.000Z',
  },
  {
    id: 'stk-2',
    name: 'Serum Gel Clot Activator 4ml (Yellow Top)',
    type: 'Blood Collection Tubes',
    indentFrom: 'HSA Central Store Utama',
    currentStock: 320,
    unit: 'pcs',
    pricePerUnit: 0.95,
    locationStored: 'Cabinet A - Shelf 2',
    warningThreshold: 80,
    expiryDate: '2027-05-15',
    batches: [
      { id: 'stk-2-b1', batchNumber: 'LOT-2027-Y1', quantity: 120, expiryDate: '2027-05-15', notes: 'Batch 1' },
      { id: 'stk-2-b2', batchNumber: 'LOT-2027-Y2', quantity: 200, expiryDate: '2027-12-31', notes: 'Batch 2' }
    ],
    notes: 'For Renal Profile, LFT, Lipid Profile',
    pictureUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-22T14:15:00.000Z',
  },
  {
    id: 'stk-3',
    name: 'Sodium Citrate 3.2% Coagulation 2.7ml (Light Blue)',
    type: 'Blood Collection Tubes',
    indentFrom: 'Medivest Central Store',
    currentStock: 35, // LOW STOCK
    unit: 'pcs',
    pricePerUnit: 1.10,
    locationStored: 'Cabinet A - Shelf 3',
    warningThreshold: 50,
    expiryDate: '2026-08-20', // Expiring Soon!
    batches: [
      { id: 'stk-3-b1', batchNumber: 'LOT-2026-C1', quantity: 35, expiryDate: '2026-08-20', notes: 'Expiring Lot' }
    ],
    notes: 'Used for PT/INR & APTT tests',
    pictureUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-25T09:00:00.000Z',
  },
  {
    id: 'stk-4',
    name: '21G Safety Blood Collection Butterfly Needle',
    type: 'Needles & Butterflies',
    indentFrom: 'KPJ Central Store',
    currentStock: 180,
    unit: 'pcs',
    pricePerUnit: 2.20,
    locationStored: 'Venepuncture Trolley 1 - Drawer 1',
    warningThreshold: 50,
    expiryDate: '2027-11-01',
    batches: [
      { id: 'stk-4-b1', batchNumber: 'LOT-2027-N1', quantity: 80, expiryDate: '2027-11-01' },
      { id: 'stk-4-b2', batchNumber: 'LOT-2028-N2', quantity: 100, expiryDate: '2028-03-15' }
    ],
    notes: 'Pediatric & difficult vein venepuncture',
    pictureUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-02T08:00:00.000Z',
    updatedAt: '2026-07-23T11:45:00.000Z',
  },
  {
    id: 'stk-5',
    name: 'Vacutainer One-Use Single Holder',
    type: 'Equipment & Devices',
    indentFrom: 'HSA Central Store Utama',
    currentStock: 200,
    unit: 'pcs',
    pricePerUnit: 0.45,
    locationStored: 'Cabinet B - Shelf 1',
    warningThreshold: 40,
    expiryDate: '2028-06-30',
    batches: [
      { id: 'stk-5-b1', batchNumber: 'LOT-2028-H1', quantity: 200, expiryDate: '2028-06-30' }
    ],
    notes: 'Compatible with standard vacuum needles',
    pictureUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-02T08:00:00.000Z',
    updatedAt: '2026-07-20T16:20:00.000Z',
  },
  {
    id: 'stk-6',
    name: 'Alcohol Prep Swab 70% Isopropyl',
    type: 'Swabs & Disinfectants',
    indentFrom: 'Store Utama IMC',
    currentStock: 8, // LOW STOCK
    unit: 'boxes (100s)',
    pricePerUnit: 12.50,
    locationStored: 'Venepuncture Trolley 2',
    warningThreshold: 10,
    expiryDate: '2026-07-15', // EXPIRED!
    batches: [
      { id: 'stk-6-b1', batchNumber: 'LOT-2026-S1', quantity: 8, expiryDate: '2026-07-15' }
    ],
    notes: 'Pre-injection / venepuncture disinfection',
    pictureUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-03T08:00:00.000Z',
    updatedAt: '2026-07-25T11:00:00.000Z',
  },
  {
    id: 'stk-7',
    name: 'Quick-Release Elastic Tourniquet Band',
    type: 'Dressings & Tourniquets',
    indentFrom: 'Store Utama IMC',
    currentStock: 15,
    unit: 'pcs',
    pricePerUnit: 8.00,
    locationStored: 'Drawer 2 - Main Desk',
    warningThreshold: 5,
    expiryDate: '2027-09-01',
    batches: [
      { id: 'stk-7-b1', batchNumber: 'LOT-2027-T1', quantity: 15, expiryDate: '2027-09-01' }
    ],
    notes: 'Reusable, disinfect with alcohol after use',
    pictureUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-07-03T08:00:00.000Z',
    updatedAt: '2026-07-21T09:30:00.000Z',
  }
];

// Initial Transaction Logs for Venepuncture Hub
const INITIAL_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'trx-101',
    itemId: 'stk-3',
    itemName: 'Sodium Citrate 3.2% Coagulation 2.7ml (Light Blue)',
    action: 'REMOVE',
    quantity: 25,
    stockBefore: 60,
    stockAfter: 35,
    destinationOrSource: 'Issued to Emergency Department Ward 1',
    staffName: 'MA Shafiq',
    notes: 'Urgent request for coagulation screening patients',
    timestamp: '2026-07-25T09:00:00.000Z',
  },
  {
    id: 'trx-102',
    itemId: 'stk-6',
    itemName: 'Alcohol Prep Swab 70% Isopropyl',
    action: 'REMOVE',
    quantity: 4,
    stockBefore: 12,
    stockAfter: 8,
    destinationOrSource: 'Venepuncture Mobile Clinic Unit 2',
    staffName: 'SN Farida',
    notes: 'Restocked trolley 2 and outpatient booth',
    timestamp: '2026-07-25T11:00:00.000Z',
  },
  {
    id: 'trx-103',
    itemId: 'stk-1',
    itemName: 'EDTA K2 3ml Vacuum Blood Tube (Lavender)',
    action: 'ADD',
    quantity: 200,
    stockBefore: 250,
    stockAfter: 450,
    destinationOrSource: 'HSA Central Store Utama Indent Batch #2026-78',
    staffName: 'MA Shafiq',
    notes: 'Monthly bulk indent receipt arrived',
    timestamp: '2026-07-24T10:30:00.000Z',
  },
  {
    id: 'trx-104',
    itemId: 'stk-4',
    itemName: '21G Safety Blood Collection Butterfly Needle',
    action: 'REMOVE',
    quantity: 20,
    stockBefore: 200,
    stockAfter: 180,
    destinationOrSource: 'Pediatric Ward 3A',
    staffName: 'Staff Nurse Aminah',
    notes: 'Weekly routine allocation',
    timestamp: '2026-07-23T11:45:00.000Z',
  }
];

const CATEGORIES: StockItemCategory[] = [
  'Blood Collection Tubes',
  'Needles & Butterflies',
  'Syringes & Lancets',
  'Swabs & Disinfectants',
  'Dressings & Tourniquets',
  'PPE & Consumables',
  'Equipment & Devices',
  'Other Supplies'
];

interface StockTakeHubProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const StockTakeHub: React.FC<StockTakeHubProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

  // Load items & logs from localStorage or defaults
  const [items, setItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem('venepuncture_stock_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed loading stock items:', e);
    }
    return INITIAL_STOCK_ITEMS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('venepuncture_stock_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed loading stock transactions:', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('venepuncture_stock_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('venepuncture_stock_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Active View State & Layout Mode
  const [viewMode, setViewMode] = useState<'inventory' | 'register' | 'logs' | 'summary'>('inventory');
  const [inventoryLayout, setInventoryLayout] = useState<'grid' | 'list'>('grid'); // 'grid' (Big Box) vs 'list' (List View)

  // Sync incoming activeTab with viewMode
  useEffect(() => {
    if (activeTab === 'stock_inventory') setViewMode('inventory');
    else if (activeTab === 'stock_register') setViewMode('register');
    else if (activeTab === 'stock_logs') setViewMode('logs');
    else if (activeTab === 'stock_summary') setViewMode('summary');
  }, [activeTab]);

  const handleSetViewMode = (mode: 'inventory' | 'register' | 'logs' | 'summary') => {
    setViewMode(mode);
    if (setActiveTab) {
      if (mode === 'inventory') setActiveTab('stock_inventory');
      else if (mode === 'register') setActiveTab('stock_register');
      else if (mode === 'logs') setActiveTab('stock_logs');
      else if (mode === 'summary') setActiveTab('stock_summary');
    }
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndent, setSelectedIndent] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState<boolean>(false);

  // Modals State
  const [stockAdjustItem, setStockAdjustItem] = useState<StockItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<StockActionType>('REMOVE');
  const [adjustQuantity, setAdjustQuantity] = useState<number | ''>(10);
  const [adjustDestination, setAdjustDestination] = useState<string>('');
  const [adjustStaffName, setAdjustStaffName] = useState<string>(currentUser?.email?.split('@')[0] || 'MA Shafiq');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Stock Adjustment Batch Options State
  const [adjustBatchMode, setAdjustBatchMode] = useState<'NEW_BATCH' | 'EXISTING_BATCH'>('NEW_BATCH');
  const [adjustSelectedBatchId, setAdjustSelectedBatchId] = useState<string>('');
  const [adjustBatchLotNum, setAdjustBatchLotNum] = useState<string>('');
  const [adjustBatchExpiry, setAdjustBatchExpiry] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [adjustDeductMode, setAdjustDeductMode] = useState<'FEFO' | 'SPECIFIC_BATCH'>('FEFO');

  // Manage Batches Modal State
  const [managingBatchesItem, setManagingBatchesItem] = useState<StockItem | null>(null);
  const [newBatchNumber, setNewBatchNumber] = useState<string>('');
  const [newBatchQty, setNewBatchQty] = useState<number | ''>(50);
  const [newBatchExpiryDate, setNewBatchExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newBatchNotes, setNewBatchNotes] = useState<string>('');

  // Batch Helper Functions
  const getItemBatches = (item: StockItem): StockBatch[] => {
    if (item.batches && item.batches.length > 0) {
      return item.batches;
    }
    return [
      {
        id: `${item.id}-default`,
        batchNumber: 'LOT-MAIN',
        quantity: item.currentStock,
        expiryDate: item.expiryDate || '2028-12-31',
        notes: 'Initial lot'
      }
    ];
  };

  const recalculateItemBatches = (item: StockItem, updatedBatches: StockBatch[]): StockItem => {
    const validBatches = updatedBatches.filter(b => b.quantity >= 0);
    const totalQty = validBatches.reduce((sum, b) => sum + b.quantity, 0);
    const sorted = [...validBatches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    const earliestActiveExp = sorted.find(b => b.quantity > 0)?.expiryDate || sorted[0]?.expiryDate || item.expiryDate || '2028-12-31';

    return {
      ...item,
      batches: sorted,
      currentStock: totalQty,
      expiryDate: earliestActiveExp,
      updatedAt: new Date().toISOString()
    };
  };

  // Threshold Adjustment Modal State
  const [thresholdItem, setThresholdItem] = useState<StockItem | null>(null);
  const [newThresholdValue, setNewThresholdValue] = useState<number>(50);

  // Edit Expiry Modal State
  const [editingExpiryItem, setEditingExpiryItem] = useState<StockItem | null>(null);
  const [editExpiryValue, setEditExpiryValue] = useState<string>('');

  // New Item Form State
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<StockItemCategory>('Blood Collection Tubes');
  const [newItemIndentFrom, setNewItemIndentFrom] = useState<string>('HSA Store Utama');
  const [newItemStock, setNewItemStock] = useState<number | ''>(100);
  const [newItemUnit, setNewItemUnit] = useState<string>('pcs');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>(1.50);
  const [newItemLocation, setNewItemLocation] = useState<string>('Cabinet A - Shelf 1');
  const [newItemThreshold, setNewItemThreshold] = useState<number | ''>(30);
  const [newItemExpiryDate, setNewItemExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newItemNotes, setNewItemNotes] = useState<string>('');
  const [newItemImage, setNewItemImage] = useState<string>('');

  // Delete Confirmation State
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Unique Indent Sources for dropdown
  const uniqueIndents = Array.from(new Set(items.map(i => i.indentFrom))).filter(Boolean);

  // Expiry Info Helper
  const getExpiryInfo = (expiryDate?: string) => {
    if (!expiryDate) {
      return { 
        label: 'No Expiry Set', 
        status: 'UNKNOWN', 
        daysLeft: 999, 
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' 
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `EXPIRED (${Math.abs(diffDays)}d ago)`,
        status: 'EXPIRED',
        daysLeft: diffDays,
        badgeClass: 'bg-rose-600 text-white border-rose-700 font-black shadow-xs'
      };
    } else if (diffDays <= 60) {
      return {
        label: `Expiring in ${diffDays} days`,
        status: 'EXPIRING_SOON',
        daysLeft: diffDays,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
      };
    } else {
      return {
        label: `Valid until ${expiryDate}`,
        status: 'VALID',
        daysLeft: diffDays,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
      };
    }
  };

  // Calculated Summary Metrics
  const totalItemsCount = items.length;
  const totalQuantityUnits = items.reduce((sum, item) => sum + item.currentStock, 0);
  const totalInventoryPriceRM = items.reduce((sum, item) => sum + (item.currentStock * item.pricePerUnit), 0);
  const lowStockItems = items.filter(item => item.currentStock <= item.warningThreshold);
  const outOfStockItems = items.filter(item => item.currentStock === 0);
  const expiringOrExpiredItems = items.filter(item => {
    const info = getExpiryInfo(item.expiryDate);
    return info.status === 'EXPIRED' || info.status === 'EXPIRING_SOON';
  });

  // Filtered Items List
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.locationStored.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.indentFrom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.type === selectedCategory;
    const matchesIndent = selectedIndent === 'ALL' || item.indentFrom === selectedIndent;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.warningThreshold;
    const matchesExpiring = !showExpiringOnly || (() => {
      const info = getExpiryInfo(item.expiryDate);
      return info.status === 'EXPIRED' || info.status === 'EXPIRING_SOON';
    })();

    return matchesSearch && matchesCategory && matchesIndent && matchesLowStock && matchesExpiring;
  });

  // Handle Image File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Register New Stock Item
  const handleRegisterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert('Please enter item name.');
      return;
    }

    if (!newItemExpiryDate) {
      alert('Please select an expiry date for this stock item.');
      return;
    }

    const stockQty = typeof newItemStock === 'number' ? newItemStock : 0;
    const price = typeof newItemPrice === 'number' ? newItemPrice : 0;
    const threshold = typeof newItemThreshold === 'number' ? newItemThreshold : 20;

    const initialBatch: StockBatch = {
      id: `b-${Date.now()}`,
      batchNumber: `LOT-${new Date().getFullYear()}-01`,
      quantity: stockQty,
      expiryDate: newItemExpiryDate,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: 'Initial registration lot'
    };

    const newItem: StockItem = {
      id: `stk-${Date.now()}`,
      name: newItemName.trim(),
      type: newItemCategory,
      indentFrom: newItemIndentFrom.trim() || 'Store Utama IMC',
      currentStock: stockQty,
      unit: newItemUnit.trim() || 'pcs',
      pricePerUnit: price,
      locationStored: newItemLocation.trim() || 'Venepuncture Desk',
      warningThreshold: threshold,
      expiryDate: newItemExpiryDate,
      batches: [initialBatch],
      notes: newItemNotes.trim(),
      pictureUrl: newItemImage || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems(prev => [newItem, ...prev]);

    // Initial Registration Log
    const initLog: StockTransaction = {
      id: `trx-${Date.now()}`,
      itemId: newItem.id,
      itemName: newItem.name,
      action: 'ADD',
      quantity: stockQty,
      stockBefore: 0,
      stockAfter: stockQty,
      destinationOrSource: `Initial Registration Indent from ${newItem.indentFrom} (Exp: ${newItemExpiryDate})`,
      staffName: currentUser?.email?.split('@')[0] || 'MA Shafiq',
      notes: `New item registered into Venepuncture Hub inventory with Expiry Date: ${newItemExpiryDate}`,
      timestamp: new Date().toISOString(),
    };

    setTransactions(prev => [initLog, ...prev]);

    // Reset Form
    setNewItemName('');
    setNewItemStock(100);
    setNewItemPrice(1.50);
    setNewItemNotes('');
    setNewItemImage('');
    handleSetViewMode('inventory');
  };

  // Save Expiry Date Update
  const handleSaveExpiryUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpiryItem || !editExpiryValue) return;

    setItems(prev => prev.map(item => {
      if (item.id === editingExpiryItem.id) {
        return {
          ...item,
          expiryDate: editExpiryValue,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    setEditingExpiryItem(null);
  };

  // Execute Stock Adjustment (Add or Remove) with multi-batch support
  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustItem) return;

    const qty = typeof adjustQuantity === 'number' ? Math.abs(adjustQuantity) : 0;
    if (qty <= 0) {
      alert('Please specify a valid quantity greater than 0.');
      return;
    }

    if (!adjustDestination.trim()) {
      alert(adjustAction === 'REMOVE' 
        ? 'Please specify where the stock goes or who it was sent to.' 
        : 'Please specify the indent origin / supplier batch info.'
      );
      return;
    }

    if (!adjustStaffName.trim()) {
      alert('Please specify staff name performing this transaction.');
      return;
    }

    const currentQty = stockAdjustItem.currentStock;
    const currentBatches = getItemBatches(stockAdjustItem);
    let updatedBatches: StockBatch[] = [];
    let logBatchDetails = '';

    if (adjustAction === 'REMOVE') {
      if (qty > currentQty) {
        alert(`Cannot remove ${qty} ${stockAdjustItem.unit}. Only ${currentQty} ${stockAdjustItem.unit} available in stock.`);
        return;
      }

      if (adjustDeductMode === 'FEFO') {
        // First-Expiring-First-Out Deduction
        let remainingToDeduct = qty;
        const sorted = [...currentBatches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        
        const deductedNames: string[] = [];
        updatedBatches = sorted.map(batch => {
          if (remainingToDeduct <= 0 || batch.quantity <= 0) return batch;
          const deductFromThis = Math.min(batch.quantity, remainingToDeduct);
          remainingToDeduct -= deductFromThis;
          deductedNames.push(`${batch.batchNumber} (-${deductFromThis})`);
          return { ...batch, quantity: batch.quantity - deductFromThis };
        });

        logBatchDetails = `[FEFO Auto Deduct: ${deductedNames.join(', ')}]`;
      } else {
        // Specific batch deduction
        const targetBatch = currentBatches.find(b => b.id === adjustSelectedBatchId) || currentBatches[0];
        if (qty > targetBatch.quantity) {
          alert(`Selected batch (${targetBatch.batchNumber}) only has ${targetBatch.quantity} ${stockAdjustItem.unit}. Choose FEFO or enter a smaller quantity.`);
          return;
        }
        updatedBatches = currentBatches.map(b => 
          b.id === targetBatch.id ? { ...b, quantity: b.quantity - qty } : b
        );
        logBatchDetails = `[Deducted from Lot ${targetBatch.batchNumber}]`;
      }
    } else {
      // ADD STOCK
      if (adjustBatchMode === 'NEW_BATCH') {
        const lotNum = adjustBatchLotNum.trim() || `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const newBatch: StockBatch = {
          id: `b-${Date.now()}`,
          batchNumber: lotNum,
          quantity: qty,
          expiryDate: adjustBatchExpiry,
          receivedDate: new Date().toISOString().split('T')[0],
        };
        updatedBatches = [...currentBatches, newBatch];
        logBatchDetails = `[Added New Batch ${lotNum}, Exp: ${adjustBatchExpiry}]`;
      } else {
        const targetBatch = currentBatches.find(b => b.id === adjustSelectedBatchId) || currentBatches[0];
        updatedBatches = currentBatches.map(b => 
          b.id === targetBatch.id ? { ...b, quantity: b.quantity + qty } : b
        );
        logBatchDetails = `[Added to Existing Lot ${targetBatch.batchNumber}]`;
      }
    }

    const updatedItem = recalculateItemBatches(stockAdjustItem, updatedBatches);

    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));

    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      itemId: stockAdjustItem.id,
      itemName: stockAdjustItem.name,
      action: adjustAction,
      quantity: qty,
      stockBefore: currentQty,
      stockAfter: updatedItem.currentStock,
      destinationOrSource: `${adjustDestination.trim()} ${logBatchDetails}`,
      staffName: adjustStaffName.trim(),
      notes: adjustNotes.trim(),
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [newTrx, ...prev]);

    setStockAdjustItem(null);
    setAdjustNotes('');
    setAdjustDestination('');
    setAdjustBatchLotNum('');
  };

  // Add a new batch directly in Manage Batches Modal
  const handleAddNewBatchToItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingBatchesItem) return;

    const qty = typeof newBatchQty === 'number' ? newBatchQty : 0;
    if (qty <= 0) {
      alert('Please enter a valid batch quantity greater than 0.');
      return;
    }
    if (!newBatchExpiryDate) {
      alert('Please select an expiration date for this stock lot.');
      return;
    }

    const lotNum = newBatchNumber.trim() || `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const currentBatches = getItemBatches(managingBatchesItem);

    const newBatch: StockBatch = {
      id: `b-${Date.now()}`,
      batchNumber: lotNum,
      quantity: qty,
      expiryDate: newBatchExpiryDate,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: newBatchNotes.trim() || undefined
    };

    const updatedBatches = [...currentBatches, newBatch];
    const updatedItem = recalculateItemBatches(managingBatchesItem, updatedBatches);

    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setManagingBatchesItem(updatedItem);

    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      itemId: updatedItem.id,
      itemName: updatedItem.name,
      action: 'ADD',
      quantity: qty,
      stockBefore: managingBatchesItem.currentStock,
      stockAfter: updatedItem.currentStock,
      destinationOrSource: `New Lot Added: ${lotNum} (Exp: ${newBatchExpiryDate})`,
      staffName: currentUser?.email?.split('@')[0] || 'MA Shafiq',
      notes: `Batch ${lotNum} registered with expiry ${newBatchExpiryDate}`,
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTrx, ...prev]);

    setNewBatchNumber('');
    setNewBatchQty(50);
    setNewBatchNotes('');
  };

  // Delete batch from Manage Batches Modal
  const handleDeleteBatchFromItem = (batchId: string) => {
    if (!managingBatchesItem) return;
    const currentBatches = getItemBatches(managingBatchesItem);
    if (currentBatches.length <= 1) {
      alert('Every stock item must maintain at least 1 active lot/batch record. You can update or adjust its quantity instead.');
      return;
    }

    const targetBatch = currentBatches.find(b => b.id === batchId);
    if (!confirm(`Are you sure you want to delete Lot ${targetBatch?.batchNumber || 'Batch'} (${targetBatch?.quantity} ${managingBatchesItem.unit})?`)) return;

    const updatedBatches = currentBatches.filter(b => b.id !== batchId);
    const updatedItem = recalculateItemBatches(managingBatchesItem, updatedBatches);

    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setManagingBatchesItem(updatedItem);
  };

  // Update Low Stock Warning Threshold
  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdItem) return;

    setItems(prev => prev.map(item => {
      if (item.id === thresholdItem.id) {
        return {
          ...item,
          warningThreshold: newThresholdValue,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    setThresholdItem(null);
  };

  // Delete Stock Item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setDeletingItemId(null);
  };

  // Reset to Default Sample Data
  const handleResetDefaults = () => {
    if (confirm('Reset inventory to initial default sample data? Any custom items will be restored.')) {
      setItems(INITIAL_STOCK_ITEMS);
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.removeItem('venepuncture_stock_items');
      localStorage.removeItem('venepuncture_stock_transactions');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-bold">
              <Syringe className="w-3.5 h-3.5 text-violet-300" />
              <span>Internal Medicine Clinic Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-futuristic">
              Stock Management System
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Track blood tubes, butterfly needles, lancets, and consumables. Monitor indent suppliers, issue stock to wards, set custom alert thresholds, and audit stock log histories in RM.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSetViewMode(viewMode === 'register' ? 'inventory' : 'register')}
              className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 min-h-[42px]"
            >
              {viewMode === 'register' ? (
                <>
                  <Package className="w-4 h-4" />
                  <span>Back to Inventory</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Register New Item</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 min-h-[42px]"
              title="Reset sample inventory data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Top Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">Total Items Indented</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">{totalItemsCount}</span>
              <span className="text-[10px] text-indigo-300 font-bold">{totalQuantityUnits} units</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">Total Inventory Value</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
                RM {totalInventoryPriceRM.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className={`rounded-2xl p-3.5 border backdrop-blur-md transition-all ${
            lowStockItems.length > 0 
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-100' 
              : 'bg-white/10 border-white/10 text-white'
          }`}>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200 flex items-center gap-1">
              {lowStockItems.length > 0 && <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />}
              <span>Low Stock Alerts</span>
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-xl sm:text-2xl font-black font-mono ${lowStockItems.length > 0 ? 'text-amber-300' : 'text-white'}`}>
                {lowStockItems.length}
              </span>
              <span className="text-[10px] text-indigo-200">Items ≤ Threshold</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">Total Logged Transactions</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-purple-300">{transactions.length}</span>
              <span className="text-[10px] text-indigo-300">Audited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSetViewMode('inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[40px] whitespace-nowrap ${
              viewMode === 'inventory'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock Inventory ({items.length})</span>
          </button>

          <button
            onClick={() => handleSetViewMode('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[40px] whitespace-nowrap ${
              viewMode === 'logs'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Issue Logs ({transactions.length})</span>
          </button>

          <button
            onClick={() => handleSetViewMode('summary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[40px] whitespace-nowrap ${
              viewMode === 'summary'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Indent & Value Dashboard</span>
          </button>
        </div>

        {/* Quick Alert Filters for Low Stock & Expiring Items */}
        {viewMode === 'inventory' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 min-h-[40px] ${
                showLowStockOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${showLowStockOnly ? 'text-white' : 'text-amber-500'}`} />
              <span>Low Stock {lowStockItems.length > 0 && `(${lowStockItems.length})`}</span>
            </button>

            <button
              onClick={() => setShowExpiringOnly(!showExpiringOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 min-h-[40px] ${
                showExpiringOnly
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${showExpiringOnly ? 'text-white' : 'text-amber-600'}`} />
              <span>Expiring / Expired {expiringOrExpiredItems.length > 0 && `(${expiringOrExpiredItems.length})`}</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: INVENTORY TABLE / GRID */}
      {/* ========================================================================= */}
      {viewMode === 'inventory' && (
        <div className="space-y-4">
          
          {/* Search, Filter & Layout View Switcher Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search item name, location, supplier, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Dropdown & Indent Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-violet-500"
              >
                <option value="ALL">All Categories ({items.length})</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Indent From Supplier Filter */}
              <select
                value={selectedIndent}
                onChange={(e) => setSelectedIndent(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-violet-500"
              >
                <option value="ALL">All Indent Sources</option>
                {uniqueIndents.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              {/* View Switcher Toggle: Big Box Grid vs List View */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setInventoryLayout('grid')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    inventoryLayout === 'grid'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Big Box View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInventoryLayout('list')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    inventoryLayout === 'list'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Alert Banners if filters active */}
          {showLowStockOnly && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>Showing items at or below low stock warning threshold!</span>
              </div>
              <button
                onClick={() => setShowLowStockOnly(false)}
                className="text-xs text-rose-700 font-extrabold underline hover:text-rose-900"
              >
                Show All Items
              </button>
            </div>
          )}

          {showExpiringOnly && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Calendar className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Showing items that are expired or expiring within 60 days!</span>
              </div>
              <button
                onClick={() => setShowExpiringOnly(false)}
                className="text-xs text-amber-800 font-extrabold underline hover:text-amber-950"
              >
                Show All Items
              </button>
            </div>
          )}

          {/* ITEMS CATALOG DISPLAY */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No stock items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query, clearing filters, or register a new item for the Venepuncture Hub.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedIndent('ALL');
                  setShowLowStockOnly(false);
                  setShowExpiringOnly(false);
                }}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : inventoryLayout === 'grid' ? (
            
            /* ======================================= */
            /* LAYOUT A: BIG BOX (CARD GRID) VIEW     */
            /* ======================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const isLowStock = item.currentStock <= item.warningThreshold;
                const isOutOfStock = item.currentStock === 0;
                const totalItemValRM = (item.currentStock * item.pricePerUnit).toFixed(2);
                const expiryInfo = getExpiryInfo(item.expiryDate);

                return (
                  <div 
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                      isOutOfStock
                        ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-300'
                        : isLowStock 
                          ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300' 
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Low Stock Warning Top Banner */}
                    {isOutOfStock ? (
                      <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 -mx-5 -mt-5 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> OUT OF STOCK</span>
                        <span>0 {item.unit}</span>
                      </div>
                    ) : isLowStock ? (
                      <div className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 -mx-5 -mt-5 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> LOW STOCK WARNING</span>
                        <span>≤ {item.warningThreshold} {item.unit} Limit</span>
                      </div>
                    ) : null}

                    <div>
                      {/* Top Row: Category & Item Photo */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1 flex-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            {item.type}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {item.name}
                          </h3>
                        </div>

                        {/* Thumbnail photo or icon */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.pictureUrl ? (
                            <img 
                              src={item.pictureUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=300';
                              }}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Stock Quantity Highlight Box */}
                      <div className={`p-3 rounded-xl mb-3 border flex items-center justify-between ${
                        isOutOfStock 
                          ? 'bg-rose-100/80 border-rose-200 text-rose-950'
                          : isLowStock 
                            ? 'bg-amber-100/80 border-amber-200 text-amber-950' 
                            : 'bg-slate-50 border-slate-200/80 text-slate-800'
                      }`}>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Available Stock</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className={`text-2xl font-black font-mono ${
                              isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-700' : 'text-slate-900'
                            }`}>
                              {item.currentStock}
                            </span>
                            <span className="text-xs font-bold text-slate-600">{item.unit}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Warning Limit</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <span className="text-xs font-extrabold font-mono text-slate-700">≤ {item.warningThreshold} {item.unit}</span>
                            <button
                              onClick={() => {
                                setThresholdItem(item);
                                setNewThresholdValue(item.warningThreshold);
                              }}
                              className="p-1 text-violet-600 hover:bg-violet-100 rounded-md transition-colors"
                              title="Adjust warning threshold limit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EXPIRY DATE BADGE ROW WITH MULTI-BATCH SUPPORT */}
                      <div className="p-2.5 rounded-xl bg-violet-50/60 border border-violet-100 flex flex-col gap-1.5 mb-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-violet-900 font-bold text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                            <span>Earliest Exp: {item.expiryDate || 'N/A'}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] border ${expiryInfo.badgeClass}`}>
                            {expiryInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-violet-100/80">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Boxes className="w-3 h-3 text-violet-600" />
                            {getItemBatches(item).length} {getItemBatches(item).length === 1 ? 'Batch' : 'Batches'}
                          </span>
                          <button
                            onClick={() => setManagingBatchesItem(item)}
                            className="text-[10px] font-extrabold text-violet-700 bg-violet-100 hover:bg-violet-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Manage Batches</span>
                          </button>
                        </div>
                      </div>

                      {/* Meta Details: Indent From, Price RM, Location */}
                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-400" /> Indent From:
                          </span>
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px]">
                            {item.indentFrom}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400" /> Location Stored:
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {item.locationStored}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <DollarSign className="w-3 h-3 text-emerald-600" /> Unit Price (RM):
                          </span>
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            RM {item.pricePerUnit.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100 text-[11px]">
                          <span className="font-bold text-emerald-900">Total Indented Value:</span>
                          <span className="font-mono font-extrabold text-emerald-700">RM {totalItemValRM}</span>
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-slate-500 italic pt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Add/Remove Stock & Delete */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setStockAdjustItem(item);
                          setAdjustAction('ADD');
                          setAdjustQuantity(20);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[36px]"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add Stock</span>
                      </button>

                      <button
                        onClick={() => {
                          setStockAdjustItem(item);
                          setAdjustAction('REMOVE');
                          setAdjustQuantity(10);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[36px]"
                      >
                        <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Issue Stock</span>
                      </button>

                      <button
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (

            /* ======================================= */
            /* LAYOUT B: LIST STYLE (TABLE) VIEW       */
            /* ======================================= */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Item & Category</th>
                      <th className="py-3.5 px-4 text-center">Current Stock</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4">Indent Supplier</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4 text-right">Price / Total Value</th>
                      <th className="py-3.5 px-4 text-center">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredItems.map(item => {
                      const isLowStock = item.currentStock <= item.warningThreshold;
                      const isOutOfStock = item.currentStock === 0;
                      const totalItemValRM = (item.currentStock * item.pricePerUnit).toFixed(2);
                      const expiryInfo = getExpiryInfo(item.expiryDate);

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isOutOfStock 
                              ? 'bg-rose-50/30' 
                              : isLowStock 
                                ? 'bg-amber-50/30' 
                                : ''
                          }`}
                        >
                          {/* Column 1: Item Name & Category */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.pictureUrl ? (
                                  <img 
                                    src={item.pictureUrl} 
                                    alt={item.name}
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=300';
                                    }}
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-slate-900 leading-snug">
                                  {item.name}
                                </h4>
                                <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Current Stock Level */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`text-base font-black font-mono ${
                                isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-700' : 'text-slate-900'
                              }`}>
                                {item.currentStock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Limit: ≤ {item.warningThreshold}
                              </span>
                            </div>
                          </td>

                          {/* Column 3: Expiry Date & Batches */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-800 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                                <span>{item.expiryDate || 'N/A'}</span>
                                <button
                                  onClick={() => setManagingBatchesItem(item)}
                                  className="p-1 text-violet-600 hover:bg-violet-100 rounded-md transition-colors"
                                  title="Manage Expiry Batches"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${expiryInfo.badgeClass}`}>
                                  {expiryInfo.label}
                                </span>
                                <button
                                  onClick={() => setManagingBatchesItem(item)}
                                  className="text-[10px] font-bold text-violet-700 hover:underline"
                                >
                                  ({getItemBatches(item).length} {getItemBatches(item).length === 1 ? 'batch' : 'batches'})
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Column 4: Indent Supplier */}
                          <td className="py-3 px-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{item.indentFrom}</span>
                            </div>
                          </td>

                          {/* Column 5: Location Stored */}
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.locationStored}</span>
                            </div>
                          </td>

                          {/* Column 6: Price & Valuation */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-mono text-xs">
                              <div className="font-bold text-slate-900">RM {totalItemValRM}</div>
                              <div className="text-[10px] text-slate-400">RM {item.pricePerUnit.toFixed(2)} / {item.unit}</div>
                            </div>
                          </td>

                          {/* Column 7: Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setStockAdjustItem(item);
                                  setAdjustAction('ADD');
                                  setAdjustQuantity(20);
                                }}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Add Stock"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setStockAdjustItem(item);
                                  setAdjustAction('REMOVE');
                                  setAdjustQuantity(10);
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Issue Stock"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingItemId(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: REGISTER NEW ITEM FORM */}
      {/* ========================================================================= */}
      {viewMode === 'register' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 font-futuristic">
                <PlusCircle className="w-5 h-5 text-violet-600" />
                Register New Venepuncture Hub Item
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter technical item specifications, indent source, price in RM, photo, and custom warning threshold.
              </p>
            </div>
            <button
              onClick={() => setViewMode('inventory')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 p-2"
            >
              Cancel & Back
            </button>
          </div>

          <form onSubmit={handleRegisterItem} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Item Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EDTA K2 3ml Vacuum Blood Tube (Lavender)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Type Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Type / Category *
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as StockItemCategory)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Indent From */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Indent From (Supplier/Store) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSA Central Store Utama, KPJ Store, Medivest"
                  value={newItemIndentFrom}
                  onChange={(e) => setNewItemIndentFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Initial Current Stock */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Current Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 500"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Unit of Measurement */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pcs, boxes (100s), packs, bottles"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Unit Price (RM) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Price Per Item (RM) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 0.85"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Location Stored */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Location Stored *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cabinet A - Shelf 2, Trolley 1"
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Expiry Date *</span>
                  <span className="text-violet-600 text-[11px] font-normal">Expiration tracking</span>
                </label>
                <input
                  type="date"
                  required
                  value={newItemExpiryDate}
                  onChange={(e) => setNewItemExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

              {/* Low Stock Warning Threshold */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Warning Threshold Amount (Low Stock Trigger) *</span>
                  <span className="text-amber-600 text-[11px] font-normal">Triggers alert badge when stock ≤ this value</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50"
                  value={newItemThreshold}
                  onChange={(e) => setNewItemThreshold(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-amber-300 bg-amber-50/30 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Picture of Item Upload */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Picture of Item (Optional)
                </label>
                <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                    {newItemImage ? (
                      <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">Supported JPG, PNG, WEBP (Max 2MB)</p>
                  </div>
                  {newItemImage && (
                    <button
                      type="button"
                      onClick={() => setNewItemImage('')}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Notes / Clinical Indications (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Primary tube for routine FBC & HbA1c tests..."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-slate-50/30"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewMode('inventory')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Register Item</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: TRANSACTION AUDIT LOGS */}
      {/* ========================================================================= */}
      {viewMode === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-futuristic">
                <History className="w-5 h-5 text-violet-600" />
                Stock Issue & Receipt Transaction Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete record of where stock was issued, who received it, quantity changes, and staff responsible.
              </p>
            </div>
            <span className="px-3 py-1 bg-violet-50 text-violet-800 text-xs font-bold rounded-full border border-violet-200 shrink-0">
              {transactions.length} Transactions Logged
            </span>
          </div>

          {/* Table of Transactions */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Action</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3">Stock Change</th>
                  <th className="p-3">Where Sent / Indent Origin</th>
                  <th className="p-3">Staff Responsible</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map(trx => {
                    const isAdd = trx.action === 'ADD';
                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(trx.timestamp).toLocaleString('en-MY', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="p-3 font-bold text-slate-900 max-w-[200px]">
                          {trx.itemName}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {isAdd ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              <ArrowUpRight className="w-3 h-3" /> ADDED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                              <ArrowDownRight className="w-3 h-3" /> REMOVED
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {isAdd ? `+${trx.quantity}` : `-${trx.quantity}`}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {trx.stockBefore} → <span className="font-bold text-slate-900">{trx.stockAfter}</span>
                        </td>
                        <td className="p-3 text-slate-700 font-semibold max-w-[220px]">
                          {trx.destinationOrSource}
                        </td>
                        <td className="p-3 text-slate-800 font-bold whitespace-nowrap">
                          {trx.staffName}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] italic max-w-[150px] truncate">
                          {trx.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 4: INDENT & VALUE DASHBOARD SUMMARY */}
      {/* ========================================================================= */}
      {viewMode === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Breakdown Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-futuristic">
                <Layers className="w-4 h-4 text-violet-600" />
                Inventory Stock Breakdown by Category
              </h3>

              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const catItems = items.filter(i => i.type === cat);
                  const catStockUnits = catItems.reduce((s, i) => s + i.currentStock, 0);
                  const catValueRM = catItems.reduce((s, i) => s + (i.currentStock * i.pricePerUnit), 0);
                  const catPercentage = totalQuantityUnits > 0 ? ((catStockUnits / totalQuantityUnits) * 100).toFixed(1) : '0';

                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">{cat} ({catItems.length} items)</span>
                        <span className="font-mono text-emerald-700">RM {catValueRM.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-violet-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, parseFloat(catPercentage))}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span>{catStockUnits} units in stock</span>
                        <span>{catPercentage}% of total quantity</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indent Suppliers Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-futuristic">
                <Building2 className="w-4 h-4 text-violet-600" />
                Indent From Sources & Suppliers
              </h3>

              <div className="space-y-3">
                {uniqueIndents.map(indent => {
                  const indItems = items.filter(i => i.indentFrom === indent);
                  const indValRM = indItems.reduce((s, i) => s + (i.currentStock * i.pricePerUnit), 0);

                  return (
                    <div key={indent} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-indigo-950">{indent}</h4>
                        <p className="text-[10px] text-slate-500">{indItems.length} items indented from this supplier</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-extrabold text-emerald-700">RM {indValRM.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD OR REMOVE (ISSUE) STOCK MODAL */}
      {/* ========================================================================= */}
      {stockAdjustItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                  adjustAction === 'ADD' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {adjustAction === 'ADD' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {adjustAction === 'ADD' ? 'Add Stock (Indent Received)' : 'Remove / Issue Stock'}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                    {stockAdjustItem.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStockAdjustItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
              
              {/* Action Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAdjustAction('ADD')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    adjustAction === 'ADD' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('REMOVE')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    adjustAction === 'REMOVE' 
                      ? 'bg-rose-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Remove Stock
                </button>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Quantity ({stockAdjustItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-[10px] text-slate-400">
                  Current Stock: {stockAdjustItem.currentStock} {stockAdjustItem.unit}
                </p>
              </div>

              {/* Batch / Expiration Options */}
              {adjustAction === 'ADD' ? (
                <div className="space-y-2 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Expiration Batch Settings
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adjustBatchMode"
                        checked={adjustBatchMode === 'NEW_BATCH'} 
                        onChange={() => setAdjustBatchMode('NEW_BATCH')} 
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Create New Batch / Lot</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adjustBatchMode"
                        checked={adjustBatchMode === 'EXISTING_BATCH'} 
                        onChange={() => setAdjustBatchMode('EXISTING_BATCH')} 
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Add to Existing Lot</span>
                    </label>
                  </div>

                  {adjustBatchMode === 'NEW_BATCH' ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Lot / Batch #</label>
                        <input
                          type="text"
                          placeholder="e.g. LOT-2027-A1"
                          value={adjustBatchLotNum}
                          onChange={(e) => setAdjustBatchLotNum(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Batch Expiry Date *</label>
                        <input
                          type="date"
                          required
                          value={adjustBatchExpiry}
                          onChange={(e) => setAdjustBatchExpiry(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-slate-600">Select Existing Batch to Receive Stock</label>
                      <select
                        value={adjustSelectedBatchId}
                        onChange={(e) => setAdjustSelectedBatchId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                      >
                        {getItemBatches(stockAdjustItem).map(b => (
                          <option key={b.id} value={b.id}>
                            Lot {b.batchNumber} (Current: {b.quantity} {stockAdjustItem.unit}, Exp: {b.expiryDate})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                  <label className="block text-xs font-bold text-rose-950 uppercase tracking-wide">
                    Stock Deduction Strategy (FEFO)
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adjustDeductMode"
                        checked={adjustDeductMode === 'FEFO'} 
                        onChange={() => setAdjustDeductMode('FEFO')} 
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Auto FEFO (First Expiring)</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="adjustDeductMode"
                        checked={adjustDeductMode === 'SPECIFIC_BATCH'} 
                        onChange={() => setAdjustDeductMode('SPECIFIC_BATCH')} 
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Select Specific Lot</span>
                    </label>
                  </div>

                  {adjustDeductMode === 'FEFO' ? (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-rose-200">
                      ⚡ Clinical FEFO protocol: Deducts from earliest expiring lot first ({getItemBatches(stockAdjustItem)[0]?.batchNumber || 'Lot'}, Exp: {getItemBatches(stockAdjustItem)[0]?.expiryDate || stockAdjustItem.expiryDate}).
                    </p>
                  ) : (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-slate-600">Select Lot to Deduct From</label>
                      <select
                        value={adjustSelectedBatchId}
                        onChange={(e) => setAdjustSelectedBatchId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-rose-300 rounded-lg bg-white"
                      >
                        {getItemBatches(stockAdjustItem).map(b => (
                          <option key={b.id} value={b.id}>
                            Lot {b.batchNumber} ({b.quantity} {stockAdjustItem.unit} left, Exp: {b.expiryDate})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Destination / Recipient (Where stock goes or send to who) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {adjustAction === 'REMOVE' ? 'Where stock goes / Sent to who *' : 'Indent Origin / Batch Supplier *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={adjustAction === 'REMOVE' ? 'e.g. Ward 4B, Dr. Tan Clinic, Emergency Unit, Discarded' : 'e.g. HSA Store Utama Indent Batch #2026-90'}
                  value={adjustDestination}
                  onChange={(e) => setAdjustDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Person who added/removed stock */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Staff Responsible (Added / Removed By) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MA Shafiq, SN Farida, Nurse Aminah"
                  value={adjustStaffName}
                  onChange={(e) => setAdjustStaffName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Remarks / Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Routine weekly replenishment"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
                    adjustAction === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm & Save Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADJUST LOW STOCK WARNING THRESHOLD MODAL */}
      {/* ========================================================================= */}
      {thresholdItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-600" />
                Adjust Warning Threshold Limit
              </h3>
              <button onClick={() => setThresholdItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Set custom low stock trigger amount for <strong className="text-slate-900">{thresholdItem.name}</strong>. An alert badge will trigger whenever available stock drops to or below this number.
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Warning Threshold ({thresholdItem.unit})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-amber-300 bg-amber-50/50 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setThresholdItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 shadow-md"
                >
                  Update Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE ITEM CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingItemId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900">Delete Item from Inventory?</h3>
            <p className="text-xs text-slate-500">
              This will remove the item from the Stock Take catalog. Previous log histories will be retained.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingItemId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deletingItemId)}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT EXPIRY DATE MODAL */}
      {/* ========================================================================= */}
      {editingExpiryItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Update Item Expiry Date
              </h3>
              <button onClick={() => setEditingExpiryItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpiryUpdate} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Set clinical expiration date for <strong className="text-slate-900">{editingExpiryItem.name}</strong>.
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  New Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={editExpiryValue}
                  onChange={(e) => setEditExpiryValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-violet-200 bg-violet-50/30 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExpiryItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 shadow-md"
                >
                  Save Expiry Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DEDICATED MANAGE EXPIRATION BATCHES MODAL */}
      {/* ========================================================================= */}
      {managingBatchesItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Batch & Expiry Date Management
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold truncate max-w-[380px]">
                    {managingBatchesItem.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setManagingBatchesItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Stock Summary Banner */}
            <div className="bg-violet-50/70 border border-violet-200/80 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-violet-800 tracking-wider">Total Stock Units</p>
                <p className="text-xl font-black font-mono text-violet-950">
                  {managingBatchesItem.currentStock} <span className="text-xs font-bold text-slate-600">{managingBatchesItem.unit}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-violet-800 tracking-wider">Active Lots / Batches</p>
                <p className="text-base font-extrabold text-violet-900 font-mono">
                  {getItemBatches(managingBatchesItem).length} {getItemBatches(managingBatchesItem).length === 1 ? 'Lot' : 'Lots'}
                </p>
              </div>
            </div>

            {/* Current Batches List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                Current Expiration Batches for Item
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {getItemBatches(managingBatchesItem).map((batch, index) => {
                  const expiryInfo = getExpiryInfo(batch.expiryDate);
                  const isFEFOPriority = index === 0 && batch.quantity > 0;

                  return (
                    <div key={batch.id} className="p-3.5 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            Lot: {batch.batchNumber}
                          </span>
                          {isFEFOPriority && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                              ⭐ FEFO Priority
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-700">
                          Qty: <span className="font-mono text-slate-900 font-extrabold">{batch.quantity} {managingBatchesItem.unit}</span>
                          {batch.notes && <span className="text-slate-400 font-normal italic ml-2">({batch.notes})</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-slate-800">
                            Exp: {batch.expiryDate}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${expiryInfo.badgeClass}`}>
                            {expiryInfo.label}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteBatchFromItem(batch.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form: Add New Expiry Batch */}
            <form onSubmit={handleAddNewBatchToItem} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Register Additional Batch / Lot Expiry Date
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Lot / Batch #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-2027-B1"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Quantity ({managingBatchesItem.unit})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatchExpiryDate}
                    onChange={(e) => setNewBatchExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-violet-300 rounded-xl bg-violet-50/50 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Batch Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HSA Indent #882 shipment"
                  value={newBatchNotes}
                  onChange={(e) => setNewBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Batch to Inventory</span>
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setManagingBatchesItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Manager
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
