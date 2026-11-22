var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name: name, price: price, qty: qty, hsn: hsn, gstRate: gstRate };
}

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: #1001 invoice uses supplied 5% and 12% rates without a coupon', function () {
  var order = {
    id: 1001,
    coupon: '',
    items: [
      item('Rice', 280, 2, '1006', 5),
      item('Ghee', 500, 1, '0405', 12)
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1060, discount: 0, tax: 88, cgst: 44, sgst: 44, total: 1148,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 2, price: 280, gstPercent: 5, line: 560, lineTax: 28 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 500, gstPercent: 12, line: 500, lineTax: 60 }
    ]
  });
  assert.deepEqual(result.checkout, {
    subtotal: 1060, discount: 0, taxable: 1060, tax: 88, cgst: 44, sgst: 44, total: 1148,
    lines: [
      { id: undefined, name: 'Rice', hsn: '1006', gstPercent: 5, gross: 560, discount: 0, taxable: 560, tax: 28, net: 588 },
      { id: undefined, name: 'Ghee', hsn: '0405', gstPercent: 12, gross: 500, discount: 0, taxable: 500, tax: 60, net: 560 }
    ]
  });
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 invoice matches checkout coupon and GST figures', function () {
  var order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      item('Rice', 600, 1, '1006', 5),
      item('Ghee', 500, 1, '0405', 12)
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1100, discount: 110, tax: 81, cgst: 40.5, sgst: 40.5, total: 1071,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 600, gstPercent: 5, line: 600, lineTax: 27 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 500, gstPercent: 12, line: 500, lineTax: 54 }
    ]
  });
  assert.equal(result.checkout.discount, 110);
  assert.equal(result.checkout.tax, 81);
  assert.equal(result.checkout.total, 1071);
  assert.equal(result.invoice.tax, result.checkout.tax);
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 invoice matches the ₹150 checkout discount cap', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      item('Rice', 1000, 1, '1006', 5),
      item('Ghee', 1240, 1, '0405', 12)
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240, discount: 150, tax: 185.49, cgst: 92.75, sgst: 92.74, total: 2275.49,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 1000, gstPercent: 5, line: 1000, lineTax: 46.65 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 1240, gstPercent: 12, line: 1240, lineTax: 138.84 }
    ]
  });
  assert.equal(result.checkout.discount, 150);
  assert.equal(result.checkout.tax, 185.49);
  assert.equal(result.checkout.total, 2275.49);
  assert.equal(result.invoice.total, result.checkout.total);
});

test('CORRECT BEHAVIOUR: #1004 invoice matches checkout HSN GST and capped SAVE10 total', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508', undefined)
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
    rows: [
      {
        name: 'Cold-Pressed Groundnut Oil 5L', sku: '-', hsn: '1508', qty: 2,
        price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5
      }
    ]
  });
  assert.deepEqual(result.invoice, {
    subtotal: result.checkout.subtotal,
    discount: result.checkout.discount,
    tax: result.checkout.tax,
    cgst: result.checkout.cgst,
    sgst: result.checkout.sgst,
    total: result.checkout.total,
    rows: result.invoice.rows
  });
});

test('CURRENT BEHAVIOUR: #1008 all-18% items without a coupon match checkout figures', function () {
  var order = {
    id: 1008,
    coupon: '',
    items: [
      item('Tea', 800, 1, '0902', 18),
      item('Coffee', 400, 1, '0901', 18)
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1200, discount: 0, tax: 216, cgst: 108, sgst: 108, total: 1416,
    rows: [
      { name: 'Tea', sku: '-', hsn: '0902', qty: 1, price: 800, gstPercent: 18, line: 800, lineTax: 144 },
      { name: 'Coffee', sku: '-', hsn: '0901', qty: 1, price: 400, gstPercent: 18, line: 400, lineTax: 72 }
    ]
  });
  assert.deepEqual(result.checkout, {
    subtotal: 1200, discount: 0, taxable: 1200, tax: 216, cgst: 108, sgst: 108, total: 1416,
    lines: [
      { id: undefined, name: 'Tea', hsn: '0902', gstPercent: 18, gross: 800, discount: 0, taxable: 800, tax: 144, net: 944 },
      { id: undefined, name: 'Coffee', hsn: '0901', gstPercent: 18, gross: 400, discount: 0, taxable: 400, tax: 72, net: 472 }
    ]
  });
});
