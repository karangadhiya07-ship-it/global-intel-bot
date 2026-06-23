export function calculateScore(item) {

let score = 50;

if(item.risk === "High"){
score += 30;
}

if(item.risk === "Medium"){
score += 15;
}

if(item.category === "Finance"){
score += 20;
}

if(item.category === "Crypto"){
score += 25;
}

if(item.category === "AI News"){
score += 15;
}

if(score > 100){
score = 100;
}

return score;

}

export function getPriority(score){

if(score >= 85){
return "CRITICAL";
}

if(score >= 70){
return "HIGH";
}

if(score >= 50){
return "MEDIUM";
}

return "LOW";

}
