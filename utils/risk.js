export function calculateGlobalRisk(news){

let total = 0;

news.forEach(item => {

if(item.risk === "High"){
total += 3;
}

if(item.risk === "Medium"){
total += 2;
}

if(item.risk === "Low"){
total += 1;
}

});

if(total >= 15){
return {
level: "CRITICAL",
color: "red"
};
}

if(total >= 10){
return {
level: "HIGH",
color: "orange"
};
}

if(total >= 5){
return {
level: "MEDIUM",
color: "yellow"
};
}

return {
level: "LOW",
color: "green"
};

}

export function getAlertMessage(level){

switch(level){

case "CRITICAL":
return "Immediate monitoring required";

case "HIGH":
return "Situation developing";

case "MEDIUM":
return "Watch closely";

default:
return "No major threats detected";

}

}
