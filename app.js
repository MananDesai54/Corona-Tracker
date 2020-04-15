//https://covid19-api.weedmark.systems/api/v1/stats?country=India&state=Delhi
//https://bing.com/covid/data
//https://api.covid19api.com/dayone/country/india

mapboxgl.accessToken = 'pk.eyJ1IjoibWFuYW5kZXNhaTU0IiwiYSI6ImNrOTFoNjRhcTAwMTAzbG51aXhvN29xYWYifQ.r0MlknNiCk8A82guPOxiPw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom:2,
    antialias:true,
});


let countries = [];
let update;

async function getData() {
    let res = await fetch('data.json');
    let data = await res.json();
    countries = data.areas;
    update = data.lastUpdated;
    displayMarker();
}
getData();

function formatNumber(number) {
    return  number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function setNumber(number) {
    const counters = document.querySelectorAll('.section p');
    const speed = 200;
    console.log(counters);

    counters.forEach((counter,index)=>{
        const updateCount = ()=>{
            const count = +counter.innerText;
            const target = +arr[index];

            const inc = target/speed;

            if(count<target) {
                counter.innerText = count + inc;
                setTimeout(updateCount,1);
            }else {
                counter.innerText = target;
            }
        }
        updateCount();
    })
}

function timeDifference() {
    const date1 = new Date(update);
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diff = Math.ceil(diffTime / (1000*60));
    let d = diff+' mins'
    if(diff>60) {
        diff = Math.ceil(diffTime / (1000*60*60));
        d = diff+' hrs'
    }
    return d;
}

function displayMarker() {
    countries.forEach(country=>{
        const total = country.totalConfirmed || 0;
        const active = country.totalConfirmed-country.totalRecovered-country.totalDeaths || 0;
        const recovered = country.totalRecovered || 0;
        const death = country.totalDeaths || 0;
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `   <div class="details">
                    <!--<img src="./image/${country.displayName}.png" alt="${country.displayName}">-->
                    <h3 class="name">${country.displayName}</h3>
                    <div class="section">
                        <h3>Total cases :&nbsp;</h3>
                        <p>${formatNumber(total)}</p>
                    </div>
                    <hr>
                    <div class="section">
                        <h3>Active :&nbsp;</h3>
                        <p>${formatNumber(active)}</p>
                    </div>
                    <div class="section">
                        <h3>Recovered :&nbsp;</h3>
                        <p>${formatNumber(recovered)}</p>
                    </div>
                    <div class="section">
                        <h3>Deceased :&nbsp;</h3>
                        <p>${formatNumber(death)}</p>
                    </div>
                    <div class="update">Last Updated ${timeDifference()} ago</div>
                </div>
            `
        );
        new mapboxgl.Marker({
            draggable: false,
        })
        .setLngLat([country.long, country.lat])
        .addTo(map)
        .setPopup(popup);
    })
}
