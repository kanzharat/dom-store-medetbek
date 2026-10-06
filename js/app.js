// Lab 5: the page on top of Store. No framework, no reload, everything through the DOM API.

// Three products to start with, so the page is not empty on the first open
const store = new Store([
  { name: 'Notebook A5', price: 1200, qty: 4 },
  { name: 'Gel pen', price: 350, qty: 12 },
  { name: 'Desk lamp', price: 7900, qty: 2 },
]);

const form = document.getElementById('add-form');
const table = document.getElementById('store-table');
const tbody = document.getElementById('store-body');
const totalCell = document.getElementById('total');
const emptyMessage = document.getElementById('empty-message');
const statusLine = document.getElementById('status');

const money = (value) => `${value.toLocaleString('ru-RU')} ₸`;

// Builds one row, the name is kept in data-name so the handler knows which item was clicked
function createRow({ name, price, qty }) {
  const row = document.createElement('tr');
  row.dataset.name = name;

  const nameCell = document.createElement('td');
  nameCell.textContent = name; // textContent, not innerHTML, so a name cannot inject markup
  row.append(nameCell);

  const priceCell = document.createElement('td');
  priceCell.className = 'num';
  priceCell.textContent = money(price);
  row.append(priceCell);

  const qtyCell = document.createElement('td');
  qtyCell.className = 'num qty-cell';
  qtyCell.append(
    makeButton('dec', '−', `Decrease the quantity of ${name}`, qty === 0),
    Object.assign(document.createElement('span'), { className: 'qty', textContent: qty }),
    makeButton('inc', '+', `Increase the quantity of ${name}`, false),
  );
  row.append(qtyCell);

  const sumCell = document.createElement('td');
  sumCell.className = 'num';
  sumCell.textContent = money(price * qty);
  row.append(sumCell);

  const actionCell = document.createElement('td');
  actionCell.className = 'num';
  actionCell.append(makeButton('remove', 'Delete', `Delete ${name}`, false, 'btn-danger'));
  row.append(actionCell);

  return row;
}

// data-action is what the one table listener reads to decide what to do
function makeButton(action, text, label, disabled, extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-small ${extraClass}`.trim();
  button.dataset.action = action;
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.disabled = disabled;
  return button;
}

// Redraws the list and the total from the store, called after every change
function render() {
  const items = store.list();
  tbody.replaceChildren(...items.map(createRow));
  totalCell.textContent = money(store.total());
  emptyMessage.hidden = items.length > 0; // the table stays, so the total is always on screen
}

function say(message) {
  statusLine.textContent = message;
}
