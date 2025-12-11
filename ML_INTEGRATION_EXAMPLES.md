// ml-integration-examples.ts
// Complete examples for integrating ML features into StockMaster

/**
 * EXAMPLE 1: Product Classification in Inventory Receiving
 */
import { imageClassifier } from './lib/ml-service';

async function processReceivedShipment(imageFile: File) {
  try {
    // Initialize ML service
    await imageClassifier.initialize();
    
    // Convert file to image element
    const img = document.createElement('img');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      img.src = e.target?.result as string;
      img.onload = async () => {
        // Classify received products
        const results = await imageClassifier.classifyProductImage(img);
        
        // Extract high-confidence predictions
        const identifiedProducts = results.predictions
          .filter(p => p.probability > 80)
          .map(p => ({
            name: p.className,
            confidence: p.probability,
            location: p.bbox ? `Position: ${p.bbox}` : 'N/A'
          }));
        
        // Update inventory system
        await updateReceivedInventory(identifiedProducts);
        
        console.log('✓ Shipment processed:', identifiedProducts);
      };
    };
    
    reader.readAsDataURL(imageFile);
  } catch (error) {
    console.error('Error processing shipment:', error);
  }
}

async function updateReceivedInventory(products: any[]) {
  // Update your database with received products
  const response = await fetch('/api/inventory/receive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date(),
      identifiedProducts: products,
      confidence: products.reduce((sum, p) => sum + p.confidence, 0) / products.length
    })
  });
  return response.json();
}

---

/**
 * EXAMPLE 2: Real-time Demand Forecasting Dashboard
 */
import { demandForecaster } from './lib/ml-service';

async function displayDemandForecastWidget(productIds: string[]) {
  try {
    // Fetch product data
    const products = await fetch(`/api/products?ids=${productIds.join(',')}`)
      .then(r => r.json());
    
    // Get forecast from API
    const forecastResponse = await fetch('/api/ml/forecast');
    const { forecasts } = await forecastResponse.json();
    
    // Find matching forecasts
    const relevantForecasts = forecasts
      .filter(f => productIds.includes(f.productId))
      .sort((a, b) => {
        // Prioritize items needing reorder
        if (a.action === 'REORDER' && b.action !== 'REORDER') return -1;
        if (a.action !== 'REORDER' && b.action === 'REORDER') return 1;
        return 0;
      });
    
    // Display as cards
    const widgetHTML = relevantForecasts.map(f => `
      <div class="forecast-card ${f.action === 'REORDER' ? 'urgent' : 'normal'}">
        <h3>${f.productName}</h3>
        <div class="forecast-metric">
          <label>Current Stock</label>
          <value>${f.currentStock}</value>
        </div>
        <div class="forecast-metric">
          <label>7-Day Forecast</label>
          <value>${f.forecastedDemand}</value>
        </div>
        <div class="forecast-metric">
          <label>Recommended</label>
          <value>${f.recommendedStock}</value>
        </div>
        <div class="forecast-metric">
          <label>Confidence</label>
          <value>${f.confidence}%</value>
        </div>
        <button onclick="reorderProduct('${f.productId}', ${f.recommendedStock})">
          ${f.action === 'REORDER' ? '🚨 Reorder Now' : '✓ No Action'}
        </button>
      </div>
    `).join('');
    
    // Inject into page
    document.getElementById('forecast-widget').innerHTML = widgetHTML;
    
  } catch (error) {
    console.error('Error displaying forecast:', error);
  }
}

---

/**
 * EXAMPLE 3: ABC Analysis for Warehouse Layout Optimization
 */
async function optimizeWarehouseLayout() {
  try {
    // Get ABC analysis
    const response = await fetch('/api/ml/abc-analysis');
    const { categories, insights } = await response.json();
    
    // Generate layout recommendations
    const layout = {
      zone_a_high_traffic: {
        category: 'A',
        placement: 'Front center - easy access',
        products: categories.A.products.slice(0, 5),
        frequency: 'Daily checks',
        reorderThreshold: 'Higher than normal'
      },
      zone_b_normal_traffic: {
        category: 'B',
        placement: 'Mid warehouse',
        products: categories.B.products,
        frequency: 'Weekly checks',
        reorderThreshold: 'Normal'
      },
      zone_c_low_traffic: {
        category: 'C',
        placement: 'Back storage',
        products: categories.C.products,
        frequency: 'Monthly checks',
        reorderThreshold: 'Lower threshold allowed'
      }
    };
    
    // Calculate cost savings
    const currentCost = 12500; // Monthly holding cost
    const potentialSavings = {
      consolidation: currentCost * 0.15, // 15% by consolidating C items
      carrying_cost: currentCost * 0.08, // 8% by optimizing stock levels
      labor_efficiency: currentCost * 0.12 // 12% by better layout
    };
    
    const totalSavings = Object.values(potentialSavings).reduce((a, b) => a + b, 0);
    
    console.log('🏭 Warehouse Layout Optimization');
    console.log('Layout Plan:', layout);
    console.log('Estimated Monthly Savings: $' + totalSavings.toFixed(2));
    console.log('Insights:', insights);
    
    return { layout, savings: totalSavings };
    
  } catch (error) {
    console.error('Error optimizing layout:', error);
  }
}

---

/**
 * EXAMPLE 4: Automated Reorder System with Safety Stock
 */
import { stockOptimizer } from './lib/ml-service';

async function setupAutomatedReorderingSystem() {
  try {
    // Fetch products
    const products = await fetch('/api/products').then(r => r.json());
    
    const reorderPlans = [];
    
    for (const product of products) {
      // Calculate safety stock for each product
      const response = await fetch('/api/ml/safety-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          avgDemand: Math.random() * 100 + 20, // Mock: 20-120 units/day
          leadTime: 5,
          serviceLevel: 0.95
        })
      });
      
      const { safetyStock, reorderPoint, economicOrderQuantity } = await response.json();
      
      // Check if reorder is needed
      if (product.quantity < reorderPoint) {
        reorderPlans.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          safetyStock,
          reorderPoint,
          recommendedOrderQty: economicOrderQuantity,
          urgency: product.quantity < safetyStock ? 'CRITICAL' : 'HIGH',
          estimatedDelivery: '2024-01-15'
        });
      }
    }
    
    // Sort by urgency
    reorderPlans.sort((a, b) => 
      a.urgency === 'CRITICAL' ? -1 : 1
    );
    
    // Create purchase orders
    for (const plan of reorderPlans) {
      await createPurchaseOrder(plan);
    }
    
    console.log('📋 Automated Reorder Plan Created');
    console.log(`Total items to reorder: ${reorderPlans.length}`);
    console.log(reorderPlans);
    
    return reorderPlans;
    
  } catch (error) {
    console.error('Error setting up reordering:', error);
  }
}

async function createPurchaseOrder(plan: any) {
  return fetch('/api/purchase-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: plan.productId,
      quantity: plan.recommendedOrderQty,
      reason: plan.urgency === 'CRITICAL' ? 'Stock below safety level' : 'Regular reorder',
      autoGenerated: true,
      generatedAt: new Date()
    })
  }).then(r => r.json());
}

---

/**
 * EXAMPLE 5: Warehouse Multi-Product Detection for Audits
 */
async function performInventoryAudit(warehousePhotoFile: File) {
  try {
    // Upload and detect
    const formData = new FormData();
    formData.append('image', warehousePhotoFile);
    
    const response = await fetch('/api/ml/detect-warehouse', {
      method: 'POST',
      body: formData
    });
    
    const { detections, totalObjectsDetected, processingTime } = await response.json();
    
    // Get current inventory from DB
    const dbInventory = await fetch('/api/inventory/current-count')
      .then(r => r.json());
    
    // Compare detected vs. actual
    const discrepancies = [];
    
    // Group detections by class
    const detectedGroups = {};
    detections.forEach(det => {
      detectedGroups[det.class] = (detectedGroups[det.class] || 0) + 1;
    });
    
    for (const [productClass, detectedCount] of Object.entries(detectedGroups)) {
      const actualCount = dbInventory[productClass] || 0;
      const difference = detectedCount - actualCount;
      
      if (Math.abs(difference) > 2) { // Allow 2-unit variance
        discrepancies.push({
          product: productClass,
          detected: detectedCount,
          actual: actualCount,
          difference,
          severity: Math.abs(difference) > 5 ? 'HIGH' : 'MEDIUM'
        });
      }
    }
    
    const auditReport = {
      timestamp: new Date(),
      photoFile: warehousePhotoFile.name,
      processingTime,
      totalObjectsDetected,
      discrepancies,
      accuracy: ((totalObjectsDetected - discrepancies.length) / totalObjectsDetected * 100).toFixed(1),
      recommendation: discrepancies.length === 0 
        ? '✓ Inventory matches physical count'
        : `⚠ Found ${discrepancies.length} discrepancies - investigate immediately`
    };
    
    // Save report
    await fetch('/api/inventory-audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditReport)
    });
    
    console.log('📸 Inventory Audit Report');
    console.log(auditReport);
    
    return auditReport;
    
  } catch (error) {
    console.error('Error performing audit:', error);
  }
}

---

/**
 * EXAMPLE 6: Real-time Smart Recommendations Panel
 */
async function loadSmartRecommendationsPanel() {
  try {
    const response = await fetch('/api/ml/recommendations');
    const { urgentActions, optimizationSuggestions, predictedTrends, costOptimization } = await response.json();
    
    // Build recommendations UI
    const panel = `
      <div class="recommendations-panel">
        <!-- Urgent Actions -->
        <section class="recommendations-section critical">
          <h2>🚨 Urgent Actions (${urgentActions.length})</h2>
          ${urgentActions.map(action => `
            <div class="action-item">
              <h4>${action.priority}: ${action.action}</h4>
              <p>${action.reason}</p>
              <button onclick="executeAction('${action.action}')">Take Action</button>
            </div>
          `).join('')}
        </section>
        
        <!-- Optimization -->
        <section class="recommendations-section">
          <h2>💡 Optimization Ideas</h2>
          ${optimizationSuggestions.map(suggestion => `
            <div class="suggestion-item">✓ ${suggestion}</div>
          `).join('')}
        </section>
        
        <!-- Trends -->
        <section class="recommendations-section">
          <h2>📊 Predicted Trends</h2>
          ${predictedTrends.map(trend => `
            <div class="trend-item">
              <strong>${trend.product}</strong>: ${trend.trend} (${trend.probability}% confidence)
            </div>
          `).join('')}
        </section>
        
        <!-- Cost Savings -->
        <section class="recommendations-section savings">
          <h2>💰 Cost Optimization</h2>
          <div class="savings-summary">
            <div>Current Monthly Cost: $${costOptimization.currentMonthlyHoldingCost}</div>
            <div>Potential Savings: $${costOptimization.estimatedSavings}</div>
            <div>Improvement: ${costOptimization.savingsPercentage}%</div>
          </div>
        </section>
      </div>
    `;
    
    document.getElementById('recommendations-container').innerHTML = panel;
    
  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
}

---

/**
 * EXAMPLE 7: ML Features Initialization (Call once on app startup)
 */
export async function initializeMLFeatures() {
  try {
    console.log('🤖 Initializing ML Features...');
    
    // Initialize image classifier
    await imageClassifier.initialize();
    console.log('✓ Image classifier ready');
    
    // Load model information
    const modelInfo = await fetch('/api/ml/model-info').then(r => r.json());
    console.log('✓ ML Models available:', modelInfo.models.length);
    
    // Setup recommendations auto-refresh (every 6 hours)
    setInterval(loadSmartRecommendationsPanel, 6 * 60 * 60 * 1000);
    console.log('✓ Recommendations auto-refresh scheduled');
    
    // Setup forecast updates (every 24 hours)
    setInterval(displayDemandForecastWidget, 24 * 60 * 60 * 1000);
    console.log('✓ Forecast auto-update scheduled');
    
    console.log('✅ ML Features initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing ML features:', error);
  }
}

---

/**
 * USAGE: Call initializeMLFeatures() in your main app initialization
 */
// In your main app.ts or index.ts:
// 
// import { initializeMLFeatures } from './ml-integration-examples';
// 
// document.addEventListener('DOMContentLoaded', async () => {
//   await initializeMLFeatures();
//   // ... rest of your initialization
// });
