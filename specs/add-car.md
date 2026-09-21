# Add a car (Guest garage)

## Application Overview

QAuto — навчальний Playwright-проєкт. Гість може увійти без реєстрації (`Guest log in`) і додати автомобіль у свій гараж через модальне вікно `Add a car` (Brand → Model → Mileage → Add).

## Передумови

- Стартовий стан завжди «чистий»: нова сесія без cookies/local storage від попередніх тестів.
- Користувач відкрив QAuto (`baseURL` з `playwright.config.ts`, `https://qauto.forstudy.space`) і натиснув `Guest log in`.
- Ліве бокове меню з пунктом `Garage` відкрите за замовчуванням; гараж гостя порожній (`You don't have any cars in your garage`).

## Тестові дані

- Brand: `Audi` (перша опція списку Brand за замовчуванням).
- Model: `TT` (перша опція списку Model для Audi за замовчуванням).
- Mileage: `12000` (довільне коректне число, задане вимогою; межові/невалідні значення mileage вимогою не задані й тут не перевіряються).

## Межі

- Один основний UI-сценарій (happy path) у Chromium + два опційні, тісно пов'язані сценарії (Add вимкнена без Mileage; Model залежить від Brand).
- Старт лише через `baseURL` із `playwright.config.ts`; без API-викликів і без реєстрації.
- Дані гостя існують лише в межах сесії (session-scoped): кожен тест стартує зі свіжого стану (новий `Guest log in`), після перезавантаження/нової сесії гараж знову порожній.
- Model залежить від Brand (підтверджено в UI: зміна Brand змінює список опцій Model).
- Точні HTML-атрибути й CSS-класи вимогою не задані; локатори нижче звірені з поточним UI через accessibility snapshot і позначені FACT; там, де accessible name відсутній (іконка Edit), позначено RISK.
- Якщо в поточному UI неможливо обрати бренд `Audi` та модель `TT` — це BLOCKER, а не вигаданий успішний результат (у цьому прогоні вибір Audi/TT підтверджено успішним).

## Джерела контракту

- Кроки сценарію та очікуваний результат: `requirements/instructions-add-car-requirement.md`.
- Візуальний вигляд модального вікна та картки доданого авто: `requirements/add-a-car-modal.png`, `requirements/added-car.png` — лише для довідки, не задають test data.
- Роль, accessible name і стан елементів (disabled/enabled, текст, класи): перевірено в поточному UI через Playwright accessibility snapshot під час підготовки цього плану; перед автоматизацією тесту звірити повторно.
- Результат запуску тесту: лише фактичний terminal output Playwright Test.

## Test Scenarios

### 1. Guest adds a car

**Seed:** `tests/seed.spec.ts`

#### 1.1. Guest adds Audi TT with mileage 12000

**File:** `tests/add-car/add-car.spec.ts`

**Steps:**
  1. Передумова: відкрити baseURL (`https://qauto.forstudy.space` з `playwright.config.ts`) і натиснути кнопку `Guest log in` (FACT: `getByRole('button', { name: 'Guest log in' })`, підтверджено accessibility snapshot).
    - expect: URL переходить на шлях, що містить `/panel/garage` (FACT).
    - expect: Ліве бокове меню відкрите за замовчуванням і містить пункт `Garage` (FACT: `link " Garage"`, активний/виділений пункт меню).
    - expect: На сторінці відображається heading рівня 1 `Garage` (FACT) та кнопка `Add car` (FACT: `getByRole('button', { name: 'Add car' })`).
  2. Крок 1. Натиснути кнопку `Add car`.
    - expect: Відкривається модальне вікно з роллю `dialog` (FACT: `page.getByRole('dialog')`).
    - expect: У модальному вікні відображається заголовок рівня 4 `Add a car` (FACT) та кнопка закриття `Close` з текстом `×` (FACT: `getByRole('button', { name: 'Close' })`).
    - expect: У модальному вікні присутні поля `Brand` (combobox), `Model` (combobox) та `Mileage` (spinbutton), а також кнопки `Cancel` і `Add` (FACT).
    - expect: Кнопка `Add` неактивна (disabled) одразу після відкриття модального вікна, поки `Mileage` порожнє (FACT, підтверджено в accessibility snapshot: `button "Add" [disabled]`).
  3. Крок 2. У полі `Brand` обрати значення `Audi` (FACT: `getByLabel('Brand').selectOption('Audi')`; combobox має accessible name `Brand` з опціями `Audi`, `BMW`, `Ford`, `Porsche`, `Fiat`).
    - expect: У combobox `Brand` обраною стає опція `Audi` (FACT).
  4. Крок 3. У полі `Model` обрати значення `TT` (FACT: `getByLabel('Model').selectOption('TT')`; для бренду `Audi` combobox `Model` містить опції `TT`, `R8`, `Q7`, `A6`, `A8`).
    - expect: У combobox `Model` обраною стає опція `TT` (FACT).
  5. Крок 4. У полі `Mileage` ввести значення `12000` (FACT: `getByRole('spinbutton', { name: 'Mileage' }).fill('12000')`).
    - expect: Поле `Mileage` містить значення `12000` (FACT).
    - expect: Кнопка `Add` стає активною (enabled) після заповнення `Mileage` (FACT, підтверджено в UI: `button "Add"` без атрибута disabled).
  6. Крок 5. Натиснути кнопку `Add`.
    - expect: Модальне вікно `Add a car` закривається (FACT).
    - expect: Відображається toast-повідомлення `Car added` (FACT, підтверджено в accessibility snapshot: `paragraph "Car added"`) — додаткове підтвердження, не є основною умовою успіху.
    - expect: У списку гаража з'являється картка доданого авто (FACT: елемент `listitem` у `list`).
    - expect: На картці відображається логотип авто — зображення з accessible name `TT` і src, що містить `audi.png` (FACT: `img` з alt=`TT`, клас `car-logo_img`).
    - expect: На картці відображається текст `Audi TT` в одному абзаці, що містить і назву бренду `Audi`, і назву моделі `TT` (FACT: `paragraph` з текстом `Audi TT`; окремих елементів лише з текстом `Audi` або лише `TT` на картці немає — RISK: перевіряти видимість бренду й моделі через `getByText('Audi TT')` або регулярний вираз, а не окремі точні локатори).
    - expect: На картці відображається іконка `Edit` (FACT: `button` з класом `car_edit btn btn-edit`, що містить `span.icon.icon-edit`; кнопка не має accessible name/aria-label — RISK: для локатора в автотесті орієнтуватись на позицію в картці (перша кнопка-іконка поруч з `Add fuel expense`), а не на роль+назву).
    - expect: На картці відображається кнопка `Add fuel expense` (FACT: `getByRole('button', { name: 'Add fuel expense' })`, клас `car_add-expense btn btn-success`).
    - expect: На картці відображається текст `Update mileage • <поточна дата>` та поле з введеним значенням пробігу `12000` (FACT: `spinbutton` без accessible name зі значенням `12000`, клас `update-mileage-form_input`).
    - expect: Кнопка `Update` на картці неактивна (disabled) (FACT: `button "Update" [disabled]`, клас `update-mileage-form_submit btn btn-secondary btn-sm`).

#### 1.2. [Опційно] Кнопка Add неактивна, поки Mileage порожнє

**File:** `tests/add-car/add-car-disabled.spec.ts`

**Steps:**
  1. Передумова: увійти як `Guest log in`, відкрити `Garage`, натиснути `Add car`.
    - expect: Модальне вікно `Add a car` відкрите, за замовчуванням `Brand` = `Audi`, `Model` = `TT` (перші опції списків), поле `Mileage` порожнє (FACT).
  2. Не заповнюючи `Mileage`, перевірити стан кнопки `Add`.
    - expect: Кнопка `Add` неактивна (disabled), доки `Mileage` не заповнене (FACT, підтверджено безпосередньо в UI).
  3. Заповнити `Mileage` значенням `12000`.
    - expect: Кнопка `Add` стає активною (enabled) (FACT).

#### 1.3. [Опційно] Список Model залежить від обраного Brand

**File:** `tests/add-car/add-car-model-depends-on-brand.spec.ts`

**Steps:**
  1. Передумова: увійти як `Guest log in`, відкрити `Garage`, натиснути `Add car`.
    - expect: За замовчуванням `Brand` = `Audi`, а `Model` містить опції `TT`, `R8`, `Q7`, `A6`, `A8` (FACT).
  2. У полі `Brand` обрати `BMW` (`getByLabel('Brand').selectOption('BMW')`).
    - expect: Список опцій `Model` змінюється на `3`, `5`, `X5`, `X6`, `Z3`, і автоматично обирається перша опція `3` (FACT, підтверджено безпосередньо в UI: до зміни бренду опції Model були `TT/R8/Q7/A6/A8`, після зміни на BMW — `3/5/X5/X6/Z3`).
    - expect: Кнопка `Add` залишається неактивною, якщо `Mileage` порожнє (FACT).
  3. Натиснути `Cancel`, щоб закрити модальне вікно без додавання авто.
    - expect: Модальне вікно закривається, гараж залишається без змін (FACT: `getByRole('button', { name: 'Cancel' })`).
