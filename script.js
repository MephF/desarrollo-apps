let array = [];

function pushElement() {
    let actualElement = document.getElementById("newItem").value;

    if(actualElement.trim() !== ""){
        array.push(actualElement);

        let li = document.createElement("li");
        li.textContent = actualElement;
        document.getElementById("list").appendChild(li);

        document.getElementById("newItem").value = "";
    }
}