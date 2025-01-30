(async function () {
  if (window.location.href !== "https://excel.codes/years/1/subjects/musculoskeletal-system") {
    return; // Stop script if URL does not match
  }

  const API_URL = "https://old.excel.codes/api/subjects";
  const AUTH_TOKEN = localStorage.token // Replace with actual token

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

    document.body.innerHTML = ""; // Clear the page

    const tableContainer = document.createElement("div");

    // Create filter dropdowns for Index, Discipline, and Instructor
    const filterDropdowns = createFilterDropdowns(items);

    tableContainer.appendChild(filterDropdowns);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const headers = ["Index", "Discipline", "Instructor", "name", "textbook", "recordings", "notes", "anki", "files", "recommendations"];

    // Create table header
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.border = "1px solid grey";
      th.style.padding = "10px";
      th.style.textAlign = "center";
      th.style.backgroundColor = "#FF0000"; // Red header background
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    items.forEach((item, index) => {
      const tr = document.createElement("tr");
      const rowColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff"; // Alternating row colors

      // "Index" column
      const indexTd = document.createElement("td");
      indexTd.style.border = "1px solid grey";
      indexTd.style.padding = "10px";
      indexTd.style.textAlign = "center";
      indexTd.style.backgroundColor = rowColor;
      indexTd.textContent = item.index;
      tr.appendChild(indexTd);

      // "Discipline" column
      const disciplineTd = document.createElement("td");
      disciplineTd.style.border = "1px solid grey";
      disciplineTd.style.padding = "10px";
      disciplineTd.style.textAlign = "center";
      disciplineTd.style.backgroundColor = rowColor;
      disciplineTd.textContent = item.discipline;
      tr.appendChild(disciplineTd);

      // "Instructor" column
      const instructorTd = document.createElement("td");
      instructorTd.style.border = "1px solid grey";
      instructorTd.style.padding = "10px";
      instructorTd.style.textAlign = "center";
      instructorTd.style.backgroundColor = rowColor;
      instructorTd.textContent = item.instructor;
      tr.appendChild(instructorTd);

      // Other columns
      headers.slice(3).forEach(header => {
        const td = document.createElement("td");
        let value = item[header];

        td.style.border = "1px solid grey";
        td.style.padding = "10px";
        td.style.textAlign = "center";
        td.style.backgroundColor = rowColor; // Alternating row colors

        if (header === "name" && value) {
          const p = document.createElement("p");
          p.textContent = value;
          td.appendChild(p);
        } else if (Array.isArray(value)) {
          if (header === "recommendations" || header === "files") {
            value.forEach(entry => {
              const box = document.createElement("div");
              box.style.border = "1px solid #ccc";
              box.style.padding = "5px";
              box.style.margin = "5px";
              box.style.backgroundColor = "#f9f9f9";
              box.style.borderRadius = "5px";

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

      table.appendChild(tr);
    });

    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);
  }

  const rawItems = await fetchData();
  const cleanedItems = cleanData(rawItems);
  createTable(cleanedItems);

  function createFilterDropdowns(items) {
    const filterContainer = document.createElement("div");

    // Create dropdown for filtering Index
    const indexOptions = createDropdownOptions(items, "index");
    const filterIndex = createFilterDropdown("Index", indexOptions);

    // Create dropdown for filtering Discipline
    const disciplineOptions = createDropdownOptions(items, "discipline");
    const filterDiscipline = createFilterDropdown("Discipline", disciplineOptions);

    // Create dropdown for filtering Instructor
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
    select.name = label.toLowerCase(); // Use the field name as the select's name

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
      if (index === 0) return; // Skip header row

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
})();
