function calculateFCFS() {
    let pids = document.querySelectorAll('.pid');
    let ats = document.querySelectorAll('.at');
    let bts = document.querySelectorAll('.bt');
    
    let processes = [];
    let ganttData = [];

    //Gather inputs
    for (let i = 0; i < pids.length; i++) {
        processes.push({
            id: pids[i].value,
            at: parseInt(ats[i].value) || 0,
            bt: parseInt(bts[i].value) || 0,
            ct: 0, tat: 0, wt: 0
        });
    }

    //Sort by Arrival Time
    processes.sort((a, b) => a.at - b.at);

    //Calculate Times
    let currentTime = 0;
    let totalTAT = 0;
    let totalWT = 0;

    for (let i = 0; i < processes.length; i++) {
        let p = processes[i];

        //Handle Idle Time
        if (currentTime < p.at) {
            ganttData.push({
                label: "Idle",
                start: currentTime,
                end: p.at
            });
            currentTime = p.at;
        }

        let startExecution = currentTime;
        currentTime += p.bt;
        
        p.ct = currentTime;
        p.tat = p.ct - p.at;
        p.wt = p.tat - p.bt;

        ganttData.push({
            label: p.id,
            start: startExecution,
            end: currentTime
        });

        totalTAT += p.tat;
        totalWT += p.wt;
    }

    //Render Gantt Chart
    let ganttContainer = document.getElementById('ganttChart');
    ganttContainer.innerHTML = ""; 

    let chartRow = document.createElement('div');
    chartRow.style.display = "flex";

    let timeRow = document.createElement('div');
    timeRow.style.display = "flex";
    timeRow.style.position = "relative";
    timeRow.style.height = "25px";

    // Add starting "0" label
    let startLabel = document.createElement('div');
    startLabel.innerText = "0";
    startLabel.style.position = "absolute";
    startLabel.style.left = "0px";
    timeRow.appendChild(startLabel);

    ganttData.forEach(block => {
        let scale = 50;
        let width = (block.end - block.start) * scale;// Scaling factor

        //Create the block
        let div = document.createElement('div');
        div.className = 'gantt-block';
        div.style.width = width + "px";
        div.style.border = "1px solid black";
        div.style.textAlign = "center";
        div.style.backgroundColor = block.label === "Idle" ? "#5364ff" : "#a3a1ff";
        div.innerText = block.label;
        chartRow.appendChild(div);

        //Create the time label at the end of the block
        let endLabel = document.createElement('div');
        endLabel.innerText = block.end;
        endLabel.style.position = "absolute";
        endLabel.style.left = (block.end * 50) + "px";
        endLabel.style.transform = "translateX(-50%)";
        timeRow.appendChild(endLabel);
    });

    ganttContainer.appendChild(chartRow);
    ganttContainer.appendChild(timeRow);

    //Update Result Table
    let resultBody = document.getElementById('resultBody');
    resultBody.innerHTML = "";
    
    //sort back by ID for the table
    processes.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

    processes.forEach(p => {
        resultBody.innerHTML += `<tr>
            <td>${p.id}</td>
            <td>${p.at}</td>
            <td>${p.bt}</td>
            <td>${p.ct}</td>
            <td>${p.tat}</td>
            <td>${p.wt}</td>
        </tr>`;
    });

    document.getElementById('avgTAT').innerText = (totalTAT / processes.length).toFixed(2);
    document.getElementById('avgWT').innerText = (totalWT / processes.length).toFixed(2);
}

function addProcess() {
    let tbody = document.querySelector('#inputTable tbody');
    let rows = tbody.querySelectorAll('tr');
    
    
    let nextId = 'P' + (rows.length + 1);
    
     //Get last arrival time(default = 0 if first row)
    let lastAT = 0;
    if (rows.length > 0) {
        let lastRowAT = rows[rows.length - 1].querySelector('.at').value;
        lastAT = parseInt(lastRowAT) || 0;
    }

    let newAT = lastAT + 1; //Increment arrival time

    let row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" value="${nextId}" class="pid" readonly></td>
        <td><input type="number" class="at" min="0" value="${newAT}"></td>
        <td><input type="number" class="bt" min="1" value="1"></td>
    `;
    
    tbody.appendChild(row);
    clearError();
}


function showError(message) {
    let errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    let errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

function removeProcess() {
    let tbody = document.querySelector('#inputTable tbody');
    let rows = tbody.querySelectorAll('tr');
    if (rows.length > 1) {
        tbody.removeChild(rows[rows.length - 1]);
    }
}