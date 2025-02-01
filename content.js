(async function () {
  if (window.location.href !== "https://excel.codes/years/1/subjects/musculoskeletal-system") {
    return;
  }

  // Add CSS variables for color customization
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --header-bg: #FF0000;
      --border-color: grey;
      --box-bg: #f9f9f9;
      --text-color: initial;
      --special-col: #f0f8ff;
      --special-text: initial;
      --background-color: white;
      --even-row: #f9f9f9;
      --odd-row: #ffffff;
    }
  `;
  document.head.appendChild(style);

  const API_URL = "https://old.excel.codes/api/subjects";
  const AUTH_TOKEN = localStorage.token;

  // Modified color controls with toggle
  function createColorControls() {
    const container = document.createElement('div');
    container.style.margin = '20px 0';
    
    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Toggle Color Customization';
    container.appendChild(toggleBtn);

    // Color controls (initially hidden)
    const colorControls = document.createElement('div');
    colorControls.style.display = 'none';
    colorControls.innerHTML = `
      <h3>Color Customization</h3>
      <div>
        <label>Header Background: <input type="color" data-target="header-bg"></label>
        <label>Borders: <input type="color" data-target="border-color"></label>
        <label>Box Background: <input type="color" data-target="box-bg"></label>
        <label>Text Color: <input type="color" data-target="text-color"></label>
        <label>Special Columns Text: <input type="color" data-target="special-text"></label>
        <label>Special Columns BG: <input type="color" data-target="special-col"></label>
        <label>Even Rows: <input type="color" data-target="even-row"></label>
        <label>Odd Rows: <input type="color" data-target="odd-row"></label>
        <label>Background: <input type="color" data-target="background-color"></label>
        <button id="resetColors">Reset Defaults</button>
      </div>
    `;

    // Load saved colors
    const colorKeys = ['header-bg', 'border-color', 'box-bg', 'text-color', 'special-col', 'special-text', 'even-row', 'odd-row', 'background-color'];
    colorKeys.forEach(key => {
      const savedColor = localStorage.getItem(key);
      if (savedColor) {
        document.documentElement.style.setProperty(`--${key}`, savedColor);
        colorControls.querySelector(`[data-target="${key}"]`).value = savedColor;
      }
    });

    // Event listeners
    colorControls.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target.dataset.target;
        const value = e.target.value;
        document.documentElement.style.setProperty(`--${target}`, value);
        localStorage.setItem(target, value);
      });
    });

    colorControls.querySelector('#resetColors').addEventListener('click', () => {
      colorKeys.forEach(key => {
        document.documentElement.style.removeProperty(`--${key}`);
        localStorage.removeItem(key);
      });
      colorControls.querySelectorAll('input[type="color"]').forEach(input => {
        input.value = '';
      });
    });

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      colorControls.style.display = colorControls.style.display === 'none' ? 'block' : 'none';
    });

    container.appendChild(colorControls);
    return container;
  }

  async function fetchData() {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Authorization": AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      return Array.isArray(data) && data.length >= 11 ? data[10]?.items || [] : [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  function cleanData(items) {
    return items.map(item => {
      const { subject, __v, practice, startsAt, endsAt, _id, type, room, ...filteredItem } = item;
      return filteredItem;
    });
  }

  function createTable(items) {
    if (items.length === 0) {
      document.body.innerHTML = "<h2>No data found.</h2>";
      return;
    }

    document.body.innerHTML = "";
    document.body.appendChild(createColorControls());

    // Add Google Sheet Button
    const googleSheetButton = document.createElement('button');
    googleSheetButton.textContent = 'TASMTGA';
    googleSheetButton.addEventListener('click', () => {
      window.open('https://docs.google.com/spreadsheets/d/1Tkx7yttE8IcD5MImrLhL2IX8LQqRNyv1UbJyFEdbhxQ/edit?gid=0#gid=0', '_blank');
    });
    document.body.appendChild(googleSheetButton);

    const tableContainer = document.createElement("div");
    const filterDropdowns = createFilterDropdowns(items);
    tableContainer.appendChild(filterDropdowns);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const headers = ["Index", "Discipline", "Instructor", "name", "textbook", "recordings", "notes", "anki", "files", "recommendations"];

    // Create sticky header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.border = "1px solid var(--border-color)";
      th.style.padding = "10px";
      th.style.textAlign = "center";
      th.style.backgroundColor = "var(--header-bg)";
      th.style.color = "var(--text-color)";
      headerRow.appendChild(th);
    });
    
    // Make header sticky
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '100';
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");
    items.forEach((item, index) => {
      const tr = document.createElement("tr");
      const rowColor = index % 2 === 0 ? "var(--even-row)" : "var(--odd-row)";

      ["index", "discipline", "instructor"].forEach((field) => {
        const td = document.createElement("td");
        td.style.border = "1px solid var(--border-color)";
        td.style.padding = "10px";
        td.style.textAlign = "center";
        td.style.backgroundColor = "var(--special-col)";
        td.style.color = "var(--special-text)";
        td.textContent = item[field];
        tr.appendChild(td);
      });

      headers.slice(3).forEach(header => {
        const td = document.createElement("td");
        let value = item[header];

        td.style.border = "1px solid var(--border-color)";
        td.style.padding = "10px";
        td.style.textAlign = "center";
        td.style.backgroundColor = rowColor;
        td.style.color = "var(--text-color)";

        if (header === "name" && value) {
          const p = document.createElement("p");
          p.textContent = value;
          td.appendChild(p);
        } else if (Array.isArray(value)) {
          if (header === "recommendations" || header === "files") {
            value.forEach(entry => {
              const box = document.createElement("div");
              box.style.border = "1px solid var(--border-color)";
              box.style.padding = "1px";
              box.style.margin = "1px";
              box.style.backgroundColor = "var(--box-bg)";
              box.style.borderRadius = "13px";

              const a = document.createElement("a");
              a.href = entry.link || "#";
              a.textContent = entry.name || header;
              a.target = "_blank";
              a.style.color = "blue";
              box.appendChild(a);
              td.appendChild(box);
            });
          } else {
            value.forEach(linkObject => {
              const a = document.createElement("a");
              a.href = linkObject.link || linkObject;
              a.textContent = linkObject.name || linkObject;
              a.target = "_blank";
              a.style.display = "block";
              a.style.color = "blue";
              td.appendChild(a);
            });
          }
        } else if (["anki", "textbook", "notes", "recordings"].includes(header) && value) {
          const a = document.createElement("a");
          a.href = value;
          a.textContent = header.charAt(0).toUpperCase() + header.slice(1);
          a.target = "_blank";
          a.style.color = "blue";
          td.appendChild(a);
        } else {
          td.textContent = value !== undefined && value !== null ? value : "";
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);
    document.body.style.backgroundColor = "var(--background-color)";
  }

  // Rest of the code remains unchanged
  function createFilterDropdowns(items) {
    const filterContainer = document.createElement("div");
    const indexOptions = createDropdownOptions(items, "index");
    const filterIndex = createFilterDropdown("Index", indexOptions);
    const disciplineOptions = createDropdownOptions(items, "discipline");
    const filterDiscipline = createFilterDropdown("Discipline", disciplineOptions);
    const instructorOptions = createDropdownOptions(items, "instructor");
    const filterInstructor = createFilterDropdown("Instructor", instructorOptions);
    filterContainer.appendChild(filterIndex);
    filterContainer.appendChild(filterDiscipline);
    filterContainer.appendChild(filterInstructor);
    return filterContainer;
  }

  function createDropdownOptions(items, field) {
    const uniqueValues = [...new Set(items.map(item => item[field] || ""))];
    return uniqueValues.map(value => ({ value, label: value }));
  }

  function createFilterDropdown(label, options) {
    const container = document.createElement("div");
    const inputLabel = document.createElement("label");
    inputLabel.textContent = `Filter by ${label}: `;
    const select = document.createElement("select");
    select.name = label.toLowerCase();
    const defaultOption = document.createElement("option");
    defaultOption.textContent = `Select ${label}`;
    defaultOption.value = "";
    select.appendChild(defaultOption);
    options.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => filterTable());
    container.appendChild(inputLabel);
    container.appendChild(select);
    return container;
  }

  function filterTable() {
    const selectedIndex = document.querySelector('select[name="index"]').value;
    const selectedDiscipline = document.querySelector('select[name="discipline"]').value;
    const selectedInstructor = document.querySelector('select[name="instructor"]').value;
    const rows = document.querySelectorAll("table tr");
    rows.forEach((row, index) => {
      if (index === 0) return;
      const rowData = row.children;
      const rowIndex = rowData[0].textContent;
      const rowDiscipline = rowData[1].textContent;
      const rowInstructor = rowData[2].textContent;
      const matchesIndex = !selectedIndex || rowIndex === selectedIndex;
      const matchesDiscipline = !selectedDiscipline || rowDiscipline === selectedDiscipline;
      const matchesInstructor = !selectedInstructor || rowInstructor === selectedInstructor;
      if (matchesIndex && matchesDiscipline && matchesInstructor) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  const rawItems = await fetchData();
  const cleanedItems = cleanData(rawItems);
  createTable(cleanedItems);
})();
