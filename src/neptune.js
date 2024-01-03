async function nepHandleAsyncReq(url, body) {  
  let res = await fetch(url, body);
  return ((res.ok == false) ? false : await res.json());
}

let nepTableIds = 0
let nepTableMetaData = {}
let nepThemes = {}
let nepEmptyTheme = {
  table: "",
  tr: "",
  th: "",
  td: "",
  delete: "",
  pages_theme: "",
  page_active: ""
}

function nepAddTheme(themeName, theme) {
  nepThemes[themeName] = theme
}

nepAddTheme("normal", {
  table: "n-table",
  tr: "n-tr n-tr-normal",
  th: "n-th n-th-normal",
  td: "n-td",
  delete: "n-delete n-delete-normal",
  pages_theme: "n-pages n-pages-normal",
  page_active: "n-pages-normal-active"
})

nepAddTheme("black", {
  table: "n-table",
  tr: "n-tr n-tr-black",
  th: "n-th n-th-black",
  td: "n-td n-td-black",
  delete: "n-delete n-delete-black",
  pages_theme: "n-pages n-pages-normal n-pages-black",
  page_active: "n-pages-black-active"
})

nepAddTheme("gray", {
  table: "n-table",
  tr: "n-tr n-tr-gray",
  th: "n-th n-th-gray",
  td: "n-td",
  delete: "n-delete n-delete-gray",
  pages_theme: "n-pages n-pages-normal",
  page_active: "n-pages-normal-active"
})

nepAddTheme("green", {
  table: "n-table",
  tr: "n-tr n-tr-green",
  th: "n-th n-th-green",
  td: "n-td",
  delete: "n-delete n-delete-gray",
  pages_theme: "n-pages n-pages-normal n-pages-green",
  page_active: "n-pages-green-active"
})      

/** Get all elements with n-table attribute and show the tables */
async function nepTableComponent() {
  const elements = document.querySelectorAll('[n-table]')
  elements.forEach(async (element) => {
    await nepGetComponent(element) // Show table
  })

  // Add dialog for update and delete rows
  const dialog = document.createElement("dialog")
  dialog.id = "n_dialog"
  dialog.classList.add("n-dialog-styles")
  document.body.append(dialog)
}

/** Show table */
async function nepGetComponent(element) {
  // Get attributes and save them in the metadata object
  const urlTable = element.getAttribute("n-url")
  let temp = element.getAttribute("n-theme")
  const theme = (nepThemes.hasOwnProperty(temp)) ? nepThemes[temp] : nepEmptyTheme
  const n_key = element.getAttribute("n-key")
  const n_show_key = element.getAttribute("n-show-key")
  const n_update = element.getAttribute("n-update")
  const n_delete = element.getAttribute("n-delete")
  const n_pagination = element.getAttribute("n-pagination")
  const n_load_spinner = element.getAttribute("n-load-spinner")
  const n_progress_spinner = element.getAttribute("n-progress-spinner")
  const tableId = `n_table${nepTableIds++}` 
  nepTableMetaData[tableId] = { 
    titles: [], 
    keys: [], 
    urlUpdate: n_update, 
    urlDelete: n_delete,
    n_key,
    n_show_key,
    theme,
    n_load_spinner,
    n_progress_spinner
  }

  const spinner = nepLoadSpinner(n_load_spinner)
  const res = await nepHandleAsyncReq(urlTable)
  
  nepHideSpinner(spinner)
  if(res === false) {
    nepShowDataError(element, "There was an error while getting the data" , () => nepGetComponent(element))
    return
  }
  
  let title = ''

  /* Get columns title */
  if(res.rows.length) {
    const keys = Object.keys(res.rows[0])
    for(let i=0;i < keys.length;i++) {
      if(n_show_key === "false" && keys[i] != n_key) {
        let title_column = nepGetTitle(keys[i])
        nepTableMetaData[tableId].titles.push(title_column)
        nepTableMetaData[tableId].keys.push(keys[i])
        title += `<th class="${theme.th}">${title_column}</th>`
      }
    }
  }

  if(n_delete)
    title += `<th class="${theme.th}">Delete</th>`

  // Get rows
  let rowsTable = nepGetRows(res.rows, nepTableMetaData[tableId])
  const pageNumbersElement = nepAddPageNumbers(n_pagination, res?.pageNumbers, tableId)

  element.classList.remove("div-parent")
  element.innerHTML += `
    <table id="${tableId}" class="${theme.table}">
      <thead>
        <tr>
          ${title}
        </tr>
      </thead>
      <tbody>
        ${rowsTable}
      </tbody>
    </table>
  `
  // Add page numbers if necessary
  if(pageNumbersElement)
    element.append(pageNumbersElement)

  nepOnDelete(n_delete, element) // Add delete button if reuired
  nepOnUpdate(n_update, element) // Add update functionality if reuired
}

function nepLoadSpinner(n_load_spinner) {
  let spinner = null
  if(n_load_spinner) {
    spinner = document.getElementById(n_load_spinner)
    spinner.style.display = "block"
  }

  return spinner
}

function nepHideSpinner(spinner) {
  if(spinner)
    spinner.style.display = "none"
}

function nepProgressSpinner(n_progress_spinner, dialog) {
  if(n_progress_spinner) {
    let spinner = document.getElementById(n_progress_spinner).cloneNode(true)
    spinner.style.display = "block"
    dialog.append(spinner)
  }
}

function nepHideProgressSpinner(n_progress_spinner, dialog) {
  if(n_progress_spinner)
    dialog.removeChild(dialog.lastChild)
}

function nepShowDataError(element, msg, callback) {
  const errorElement = document.createElement("div")
  errorElement.setAttribute("n-error-container", "")
  errorElement.innerHTML = `
  <div style="text-align: center; margin-top: 10px;">
    <div class="n-alert n-error-data">
        <div>${msg}</div>
        <button class="n-try-again">Try again</button>
    </div>
  </div>
  `

  element.append(errorElement)
  element.lastChild.addEventListener("click", (e) => {
    if(e.target.tagName === "BUTTON" && e.target.innerText === "Try again") {
      element.removeChild(element.lastChild) // Remove the error message
      callback()
    }
  })
}

function nepShowSuccess(element, msg) {
  element.innerHTML = `
    <div style="text-align: center; margin-top: 10px;">
      <div class="n-alert n-success-data">
        ${msg}
      </div>
      <div style="margin-top: 20px;">
        <button class="n-dialog-btn n-dialog-btn-primary" onclick="nepCloseDialog()">Accept</button>
      </div>
    </div>
  `
}

function nepValidationErrors(dialog, messages) {
  let errors = ""
  messages.forEach(message => {
    errors += `<li>${message}</li>`
  })

  dialog.innerHTML += `
    <div n-validation-errors style="text-align: center; margin-top: 10px;">
      <div class="n-alert n-error-data n-errors">
        ${errors}
      </div>
    </div>
  `
}

function nepGetRows(rows, metaData) {
  let rowsTable = ''
  const n_key = metaData.n_key
  const theme = metaData.theme
  const n_show_key = metaData.n_show_key
  const n_delete = metaData.urlDelete
  const n_update = metaData.urlUpdate

  let updateCursor = ""
  if(n_update)
    updateCursor = "n-update-cursor"

  // Construct the tbody
  for(let i=0;i < rows.length;i++) {
    rowsTable += `<tr n-key="${rows[i][n_key]}"  class="${theme.tr}">`
    if(n_show_key === "false") // Don't show the row key if required
      delete rows[i][n_key]

    const row = Object.values(rows[i])
    
    for(let j=0;j < row.length;j++) {
      rowsTable += `<td class="${theme.td} ${updateCursor}">${row[j]}</td>`
    }

    if(n_delete)
      rowsTable += `<td class="${theme.td}"><button class="${theme.delete}">Delete</button></td>`

    rowsTable += "</tr>"
  }

  return rowsTable
}

/** Convert from fieldName or field_name to Field Name */
function nepGetTitle(title_column) {
  if(/^[a-z][A-Za-z]*$/.test(title_column))
    return title_column.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
  else if(/^[a-zA-Z]+(_[a-zA-Z]+)*$/.test(title_column)) {
    title_column = title_column.toLowerCase()
    let words =  title_column.replace(/_/g, " ").split(" ")
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);     
    }

    return words.join(" ")
  }

  return title_column
}

/** Delete button */
function nepOnDelete(n_delete, element) {
  if(n_delete) {
    element.addEventListener("click", (e) => {
      if(e.target.tagName === "BUTTON" && e.target.innerText === "Delete") {
        const dialog = document.getElementById("n_dialog")
        const parentNode = e.target.parentElement.parentElement
        const key = parentNode.getAttribute("n-key")
        const tableId = parentNode.parentElement.parentElement.id

        dialog.style.width = "30%"

        dialog.innerHTML = `
          <div style="text-align: center;">
            <div class="n-dialog-title">Are you sure?</div>
            <input type="hidden" id="n_key_row" value="${key}" />
            <input type="hidden" id="n_table_id" value="${tableId}" />
            <div class="n-div-delete-btn">
              <button class="n-dialog-btn n-dialog-btn-primary" onclick="nepDeleteRow()">Confirm</button>
              <button class="n-dialog-btn n-dialog-btn-warning" onclick="nepCloseDialog()">Cancel</button>
            </div>
          </div>
        `

        dialog.showModal()
      }
    })
  }
}

/** Delete request */
async function nepDeleteRow() {
  const rowKey = document.getElementById("n_key_row").value
  const tableId = document.getElementById("n_table_id").value
  const rowTr = document.getElementById(tableId).querySelector(`[n-key="${rowKey}"]`)
  const dialog = document.getElementById("n_dialog")

  const n_progress_spinner = nepTableMetaData[tableId].n_progress_spinner
  let urlDelete = nepTableMetaData[tableId].urlDelete
  urlDelete = urlDelete.replace(/\{key\}/, rowKey)

  /* If the error element exists, then remove it */
  const errorElement = dialog.querySelector("[n-error-container]")
  if(errorElement)
    errorElement.remove()

  nepProgressSpinner(n_progress_spinner, dialog)
 
  const res = await nepHandleAsyncReq(urlDelete, {
    method: "DELETE"
  })

  nepHideProgressSpinner(n_progress_spinner, dialog)
  if(res === false)
    nepShowDataError(dialog, "There was an error while deleting the row", () => nepDeleteRow())
  else {
    rowTr.classList.add("n-tr-remove")
    rowTr.addEventListener("transitionend", () => {
      rowTr.remove()
    })
    nepShowSuccess(dialog, "The row was deleted")
  }
}

/** Update functionality */
function nepOnUpdate(n_update, element) {
  if(n_update) {
    element.addEventListener("dblclick", (e) => {
        if(e.target.tagName === "TD") {
        const dialog = document.getElementById("n_dialog")
        const parentNode = e.target.parentElement
        const key = parentNode.getAttribute("n-key")
        const tableId = parentNode.parentElement.parentElement.id
        
        const cellValues = Array.from(parentNode.children).map((child) => child.innerText)
        let formUpdate = ""
        nepTableMetaData[tableId].titles.forEach((element, index) => {
          formUpdate += `
            <div class="n-dialog-field">
              <label class="n-dialog-label">${element}</label>
              <input type="text" class="n-dialog-input" value="${cellValues[index]}" />
            </div>
          `
        })

        dialog.style.width = "40%"

        dialog.innerHTML = formUpdate + `
          <input type="hidden" id="n_key_row" value="${key}" />
          <input type="hidden" id="n_table_id" value="${tableId}" />
          <div class="n-div-btn">
            <button class="n-dialog-btn n-dialog-btn-primary" onclick="nepUpdateRow()">Update</button>
            <button class="n-dialog-btn n-dialog-btn-warning" onclick="nepCloseDialog()">Cancel</button>
          </div>
        `
        dialog.showModal()
      }
    })
  }
}

/** Update request */
async function nepUpdateRow() {
  const rowKey = document.getElementById("n_key_row").value
  const tableId = document.getElementById("n_table_id").value
  const urlUpdate = nepTableMetaData[tableId].urlUpdate
  const fields = nepTableMetaData[tableId].keys
  const dialog = document.getElementById("n_dialog")
  const inputs = dialog.querySelectorAll("input[type=text]")
  const n_progress_spinner = nepTableMetaData[tableId].n_progress_spinner

  const body = { nRowKey: rowKey }

  Array.from(inputs).forEach((element, index) => {
    body[fields[index]] = element.value
  })

  /* If the error element exists, then remove it */
  const errorElement = dialog.querySelector("[n-error-container]")
  if(errorElement)
    errorElement.remove()

  /* If the validation element exists, then remove it */
  const validation = dialog.querySelector("[n-validation-errors]")
  if(validation)
    validation.remove()

  nepProgressSpinner(n_progress_spinner, dialog)

  const res = await nepHandleAsyncReq(urlUpdate, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })

  nepHideProgressSpinner(n_progress_spinner, dialog)

  if(res === false)
    nepShowDataError(dialog, "There was an error while updating the data", () => nepUpdateRow())
  else if(res?.messages?.length)
    nepValidationErrors(dialog, res.messages)
  else {
    let trRow = document.getElementById(tableId).querySelector(`[n-key="${rowKey}"]`)
    trRow = Array.from(trRow.children).filter((element) => element.firstChild.nodeName == "#text" )
    trRow.forEach((element, index) => {
      element.innerHTML = inputs[index].value
    })
    nepShowSuccess(dialog, "The row was updated")
  }
}

function nepCloseDialog() {
  const dialog = document.getElementById("n_dialog")
  dialog.close()
}

/** Add pages */
function nepAddPageNumbers(n_pagination, pageNumbers, tableId) {
  let pageNumbersElement = null

  if(n_pagination) {
    pageNumbersElement = document.createElement("div")
    pageNumbersElement.classList.add("n-pages-div")

    for(let i=0;i < pageNumbers;i++) {
      let pageTheme = nepTableMetaData[tableId].theme.pages_theme
      let pageActive = (i == 0) ? nepTableMetaData[tableId].theme.page_active : "" // Add active class
      pageNumbersElement.innerHTML += `<button n-page-number="${i + 1}" class="${pageTheme} ${pageActive}">${i + 1}</button>`
    }

    pageNumbersElement.addEventListener("click", (e) => {
      if(e.target.tagName === "BUTTON") {
        const pageActive = nepTableMetaData[tableId].theme.page_active
        if(pageActive && pageActive != "") {
          /* Remove active class and add it to the new button */
          const active = e.target.parentElement.querySelector("." + pageActive)
          active.classList.remove(pageActive)

          e.target.classList.add(pageActive)
        }

        const page = e.target.getAttribute("n-page-number")
        nepNextPage(n_pagination, page, tableId)
      }
    })
  }

  return pageNumbersElement
}

/** Next page request */
async function nepNextPage(urlnepNextPage, page, tableId) {
  const n_load_spinner = nepTableMetaData[tableId].n_load_spinner
  const tableElement = document.getElementById(tableId).querySelector("tbody")
  urlnepNextPage = urlnepNextPage.replace(/\{page\}/, page)

  tableElement.parentElement.scrollIntoView(true)
  
  let spinner = null
  if(n_load_spinner) {
    spinner = document.getElementById(n_load_spinner).cloneNode(true)
    spinner.style.display = "block"

    tableElement.innerHTML = `<tr><td colspan="${nepTableMetaData[tableId].titles.length + 1}"></td></tr>`
    tableElement.firstChild.firstChild.append(spinner)
  }

  const res = await nepHandleAsyncReq(urlnepNextPage)
  if(spinner) 
    tableElement.removeChild(tableElement.firstElementChild)
  if(res === false) {
    tableElement.innerHTML = `<tr><td colspan="${nepTableMetaData[tableId].titles.length + 1}"></td></tr>`
    nepShowDataError(tableElement.firstChild.firstChild, "There was an error while getting the data", () => nepNextPage(urlnepNextPage, page, tableId))
  }

  const rowsTable = nepGetRows(res.rows, nepTableMetaData[tableId])
  
  tableElement.innerHTML = rowsTable

}

nepTableComponent()