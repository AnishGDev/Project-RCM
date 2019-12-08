const zerorpc = require('zerorpc');
const electron = require('electron')
let client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:9999")


var remote = require('electron').remote;   
let button = document.querySelector("#launch-button");
let length = document.querySelector("#height");
let width = document.querySelector("#width");
let text = document.querySelector("#bottom-text");
let ipAddress = document.querySelector("#ip-address")
button.addEventListener('click', ()=>{
    button.classList.add('is-loading')
    // Check if there is a value!
    client.invoke("testConnection", ipAddress.value, (error, res)=>{
        if (error) {
            console.log(error);
            button.classList.remove('is-loading')
            button.classList.remove('is-info')
            button.classList.add('is-danger')
            text.textContent = "Please enter a valid ip-address"
        } else {
            if(length.value == "" || width.value == "" || ipAddress.value == "" || isNaN(length.value) || isNaN(width.value)) {
                console.log("Gotta enter a value!")
                button.classList.remove('is-loading')
                button.classList.remove('is-info')
                button.classList.add('is-danger')
                text.textContent = "Please enter a valid height and width!"
            } else {
                button.classList.remove('is-loading')
                button.classList.remove('is-danger')
                remote.getGlobal('infoVault').height = length.value
                remote.getGlobal('infoVault').width = width.value
                remote.getGlobal('infoVault').ip = ipAddress.value
                
                electron.remote.getCurrentWindow().loadFile("robo.html")
            }
        }
    })
})

/*
button.addEventListener('click', ()=> {
    button.classList.add('is-loading')
    client.invoke("move",ip.value, (error,res)=>{
        if (error){
            console.error(error);
            console.log(error)
            button.classList.remove('is-loading')
            button.classList.remove('is-info')
            button.classList.add('is-danger')
        } else {
            button.classList.remove('is-loading')
            button.classList.add('is-success')
            button.classList.remove('is-danger')
            console.log(res);
            console.log("omfg it worked")
        }
    })
})
*/
