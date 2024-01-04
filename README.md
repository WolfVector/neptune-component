# Neptune

Neptune is a table component that allows you to build tables faster. Just write a small html and observe the results:
```html
<div 
    n-table                                     <!-- Define the table -->
    n-url="/your/data"                          <!-- url to get the data -->
    n-theme="normal" 
    n-title                                     <!-- Transform titles from titleName or title_name to Title Name -->
    n-update="/your/data/update"                <!-- Show a modal and update the information using your endpoint -->
    n-key="id"                                  <!-- Define the key so the library can pass the value to your endpoint and know which row to update or delete -->
    n-show-key="false"                          <!-- Don't show the key values -->
    n-delete="/your/data/delete/{key}"          <!-- Show delete button and use your endpoint to delete the row -->
    n-pagination="/your/data/next-page/{page}"  <!-- Show pagination buttons and define the url to get more information -->
    n-load-spinner="normal_spinner"             <!-- Show spinner when information is loading -->
    n-progress-spinner="small_spinner"          <!-- Show spinner when row is updating or being deleted -->
    >
    <!-- These spinners are included in the library -->
    <div id="normal_spinner" class="n-div-spinner">
        <div class="basic-loader"></div>
    </div>
    <div id="small_spinner" class="n-div-spinner">
        <div class="small-loader"></div>
    </div>
</div>
```
![](example.gif)

Neptune can also show validation errors.

## Installation

Just include the library using the CDN and you are good to go.
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WolfVector/neptune-component/src/neptune.min.css" />

<script src="https://cdn.jsdelivr.net/gh/WolfVector/neptune-component/src/neptune.min.js"></script>
```

Also, you can download the files and use them locally
```js
<link rel="stylesheet" href="neptune.css" />

<script src="neptune.js"></script>
```

## Usage

### Basic example

The `n-url` attribute defines the endpoint from where to get the data. The library expects the data in a `rows` property.

Endpoint example
```js
router.get("/your/data", async function(req, res) {
    const data = await query("SELECT * FROM table")
    res.json({ rows: data })
})
```

Table component
```html
<div 
    n-table                     <!-- Define the table -->
    n-url="/your/data"      <!-- url to get the data -->
    n-theme="normal" 
    n-title                     <!-- Transform titles from titleName or title_name to Title Name -->
    >
</div>
```

### Update and n-key

You can pass the `n-update` attribute in order to update the information using a modal. To display the modal you double click the row. It's important to provide the `n-key` attribute to define your row key, in this way, the library will pass it to your endpoint. The data to be updated and the key value will be send using the POST method, in the format of a json object.

For example, let's say you have the next endpoint that returns your data:

```js
router.get("/your/data", async function(req, res) {
    const data = await query("SELECT id, email, name, lastName FROM table")
    res.json({ rows: data })
})
```

Then Neptune will use the table fields to construct the json object:

```js
const data = {
    id: keyValue,
    email: emailValue,
    name: nameValue,
    lastName: lastNameValue
}
```
You can use the next table component:

```html
<div 
    n-table                             <!-- Define the table -->
    n-url="/your/data"                  <!-- url to get the data -->
    n-theme="normal" 
    n-title                             <!-- Transform titles from titleName or title_name to Title Name -->
    n-show-key="false"                  <!-- Don't show the key values -->
    n-key="id"                          <!-- Define the key so the library can pass the value to your endpoint-->
    n-update="/your/data/update"        <!-- Show a modal and update the information using your endpoint -->
    n-load-spinner="normal_spinner"     <!-- Id of the spinner when information is loading -->   
    n-progress-spinner="small_spinner"  <!-- Id of the spinner when row is updating or being deleted -->
    >
    <!-- These spinners are included in the library -->
    <div id="normal_spinner" class="n-div-spinner">
        <div class="basic-loader"></div>
    </div>
    <div id="small_spinner" class="n-div-spinner">
        <div class="small-loader"></div>
    </div>
</div>
```

You can use the `n-load-spinner` and `n-progress-spinner` attributes to define the ids of yours spinners. It's very important to put the spinners inside the `div`

### Delete

The `n-delete` attribute will display a delete button in every row of the table. This attribute must have the pattern: `/your/data/delete/{key}`. You can put the `{key}` substring anywhere you want, this substring gets replaced by the actual key value.

```html
<div 
    n-table                             <!-- Define the table -->
    n-url="/your/data"                  <!-- url to get the data -->
    n-theme="normal" 
    n-title                             <!-- Transform titles from titleName or title_name to Title Name -->
    n-show-key="false"                  <!-- Don't show the key values -->
    n-key="id"                          <!-- Define the key so the library can pass the value to your endpoint-->
    n-delete="/your/data/delete/{key}"  <!-- Show delete button and use your endpoint to delete the row -->
    n-load-spinner="normal_spinner"     <!-- Id of the spinner when information is loading -->   
    n-progress-spinner="small_spinner"  <!-- Id of the spinner when row is updating or being deleted -->
    >
    <!-- These spinners are included in the library -->
    <div id="normal_spinner" class="n-div-spinner">
        <div class="basic-loader"></div>
    </div>
    <div id="small_spinner" class="n-div-spinner">
        <div class="small-loader"></div>
    </div>
</div>
```

### Pagination

Use `n-pagination` attribute to show pagination buttons and define your endpoint to get more data. In order to show the pagination buttons you must provide the property `pageNumbers` in your `n-url` endpoint

Endpoint example
```js
router.get("/your/data", async function(req, res) {
    const pages = await query("SELECT COUNT(*) FROM table")
    const data = await query("SELECT * FROM table LIMIT 20")
    res.json({ rows: data, pageNumbers: pages })
})
```

The library will use `pageNumbers` to show the buttons. 

```html
<div 
    n-table                                     <!-- Define the table -->
    n-url="/your/data"                          <!-- url to get the data -->
    n-theme="normal" 
    n-title                                     <!-- Transform titles from titleName or title_name to Title Name -->
    n-show-key="false"                          <!-- Don't show the key values -->
    n-key="id"                                  <!-- Define the key so the above works -->
    n-pagination="/your/data/next-page/{page}"  <!-- Show pagination buttons and define the url to get more information -->
    n-load-spinner="normal_spinner"             <!-- Id of the spinner when information is loading -->   
    >
    <!-- These spinners are included in the library -->
    <div id="normal_spinner" class="n-div-spinner">
        <div class="basic-loader"></div>
    </div>
</div>
```

Also, notice the way you define the `n-pagination` attribute, is identical to `n-delete`. So you can put the `{page}` substring anywhere you want, this substring gets replaced by the actual page value. Neptune does the next behind the scenes:

```js
let fullUrl = urlnepNextPage.replace(/\{page\}/, page)
const res = await fetch(fullUrl)
```

![](pagination.gif)

### Full example

```html
<div 
    n-table                                     <!-- Define the table -->
    n-url="/your/data"                          <!-- url to get the data -->
    n-theme="normal" 
    n-title                                     <!-- Transform titles from titleName or title_name to Title Name -->
    n-update="/your/data/update"                <!-- Show a modal and update the information using your endpoint -->
    n-key="id"                                  <!-- Define the key so the library can pass the value to your endpoint and know which row to update or delete -->
    n-show-key="false"                          <!-- Don't show the key values -->
    n-delete="/your/data/delete/{key}"          <!-- Show delete button and use your endpoint to delete the row -->
    n-pagination="/your/data/next-page/{page}"  <!-- Show pagination buttons and define the url to get more information -->
    n-load-spinner="normal_spinner"             <!-- Show spinner when information is loading -->
    n-progress-spinner="small_spinner"          <!-- Show spinner when row is updating or being deleted -->
    >
    <!-- These spinners are included in the library -->
    <div id="normal_spinner" class="n-div-spinner">
        <div class="basic-loader"></div>
    </div>
    <div id="small_spinner" class="n-div-spinner">
        <div class="small-loader"></div>
    </div>
</div>
```

### Validation errors

You can show the validation errors returned by your endpoint. Neptune expects this errors to be in the `messages` property. This property must be an array.



### Themes

- normal
- gray
- black
- green

### Font and css customization

Donlowad the css file and modify the `:root` to change the font

```css
:root {
    --font: "Roboto";
    --font-weight: 500;
}
```

Neptune uses the nexts properties to style the table

```js
const themeExample = {
    table: "table-class",
    tr: "tr-class",
    th: "th-class",
    td: "td-class",
    delete: "delete-class",
    pages_theme: "pagination-class",
    page_active: "page-active-class" // active button
}
```

For the moment the only way to add more themes is to go directly to the `js` file and call the function `nepAddTheme` with your theme object. 
