const apiUrl = "http://localhost:8080/api/employees"

const role = localStorage.getItem("role")
const username = localStorage.getItem("username")

document.getElementById("profileUsername").innerText=username
document.getElementById("profileRole").innerText=role

if(role !== "ADMIN"){
document.getElementById("adminSection").style.display="none"
}

function showPage(page){

document.getElementById("dashboardPage").style.display="none"
document.getElementById("employeesPage").style.display="none"
document.getElementById("profilePage").style.display="none"

if(page==="dashboard"){
document.getElementById("dashboardPage").style.display="block"
}

if(page==="employees"){
document.getElementById("employeesPage").style.display="block"
}

if(page==="profile"){
document.getElementById("profilePage").style.display="block"
}

}

async function loadEmployees(){

const res = await fetch(apiUrl)
const employees = await res.json()

const container = document.getElementById("employeeCards")

container.innerHTML=""

document.getElementById("employeeCount").innerText=employees.length

employees.forEach(e=>{

const card=document.createElement("div")

card.className="employeeCard"

card.innerHTML=`<h3>${e.name}</h3><p>${e.position}</p>`

container.appendChild(card)

})

createChart(employees.length)

}

async function addEmployee(){

const name=document.getElementById("name").value
const position=document.getElementById("position").value

await fetch(apiUrl,{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({name,position})
})

loadEmployees()

}

function createChart(total){

new Chart(document.getElementById("employeeChart"),{

type:"doughnut",

data:{
labels:["Employees","Remaining"],
datasets:[{data:[total,100-total]}]
}

})

}

function logout(){

localStorage.clear()
window.location="login.html"

}

loadEmployees()