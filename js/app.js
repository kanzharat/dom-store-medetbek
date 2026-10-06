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

// Checks the three fields and returns the clean values plus a message per bad field
function validate({ name, price, qty }) {
  const errors = {};
  const cleanName = name.trim();
  const cleanPrice = Number(price.replace(',', '.'));
  const cleanQty = Number(qty);

  if (cleanName === '') errors.name = 'Enter a name';
  else if (store.find(cleanName)) errors.name = 'Already in the list, change the quantity with the + button';

  if (price.trim() === '') errors.price = 'Enter a price';
  else if (!Number.isFinite(cleanPrice)) errors.price = 'Price must be a number';
  else if (cleanPrice <= 0) errors.price = 'Price must be greater than zero';

  if (qty.trim() === '') errors.qty = 'Enter a quantity';
  else if (!Number.isFinite(cleanQty)) errors.qty = 'Quantity must be a number';
  else if (!Number.isInteger(cleanQty)) errors.qty = 'Quantity must be a whole number';
  else if (cleanQty < 1) errors.qty = 'Quantity must be at least 1';

  return { item: { name: cleanName, price: cleanPrice, qty: cleanQty }, errors };
}

// Puts the message under the field instead of alert, the field itself is marked too
function showError(fieldName, message) {
  const field = form.elements[fieldName];
  const box = form.querySelector(`[data-error-for="${fieldName}"]`);
  box.textContent = message ?? '';
  field.classList.toggle('is-invalid', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

// submit, not click: the Enter key works and the page does not reload
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const { name, price, qty } = form.elements;
  const { item, errors } = validate({ name: name.value, price: price.value, qty: qty.value });

  ['name', 'price', 'qty'].forEach((field) => showError(field, errors[field]));

  const firstBad = ['name', 'price', 'qty'].find((field) => errors[field]);
  if (firstBad) {
    form.elements[firstBad].focus();
    say('Check the fields marked in red.');
    return;
  }

  store.add(item);
  render();
  form.reset();
  name.focus();
  say(`Added: ${item.name}, ${item.qty} pcs.`);
});

// One more delegated listener: typing in any field clears the error of that field
form.addEventListener('input', (event) => {
  const field = event.target;
  if (field.name && form.elements[field.name]) showError(field.name, '');
});

// EVENT DELEGATION: one listener on the whole table serves the buttons of every row,
// including rows that do not exist yet, so nothing has to be rebound after render()
table.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !table.contains(button)) return;

  const { name } = button.closest('tr').dataset;
  const item = store.find(name);
  if (!item) return;

  const { action } = button.dataset;
  if (action === 'remove') {
    store.remove(name);
    say(`Deleted: ${name}.`);
  } else if (action === 'inc') {
    store.setQty(name, item.qty + 1);
    say(`${name}: ${item.qty} pcs.`);
  } else if (action === 'dec') {
    store.setQty(name, item.qty - 1);
    say(`${name}: ${item.qty} pcs.`);
  }

  render(); // the total is recalculated here, so it is always in sync with the store
});

render();
