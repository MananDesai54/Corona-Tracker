//https://covid19-api.weedmark.systems/api/v1/stats?country=India&state=Delhi
//https://bing.com/covid/data
//https://api.covid19api.com/dayone/country/india

mapboxgl.accessToken = 'pk.eyJ1IjoibWFuYW5kZXNhaTU0IiwiYSI6ImNrOTFoNjRhcTAwMTAzbG51aXhvN29xYWYifQ.r0MlknNiCk8A82guPOxiPw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom:2,
    antialias:true,
    center:[0,0]
});


let countries = [];
let update,data;
let markerArray = [];
let stateMarkerArray = [];

async function getData() {
    let res = await fetch('data.json');
    data = await res.json();
    countries = data.areas;
    update = data.lastUpdated;
    display();
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
    let diff = Math.ceil(diffTime / (1000*60));
    let d = diff+' mins'
    if(diff>60) {
        diff = Math.ceil(diffTime / (1000*60*60));
        d = diff+' hrs'
    }
    return d;
}

function makePopup(area,total,active,recovered,death) {
    return  new mapboxgl.Popup({ offset: 25 }).setHTML(
        `   <div class="details">
                <!--<img src="./image/${area.displayName}.png" alt="${area.displayName}">-->
                <h3 class="name">${area.displayName}</h3>
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
}

function getColor(total) {
    let color;
    if(total>=1000 && total<10000) {
        color='#ffb3b3'
    }else if(total>=10000 && total<100000) {
        color='yellow'
    }else if(total>=100000 && total<500000) {
        color='orange'
    }else if(total>=500000) {
        color='#ff0000'
    }else if(total<1000){
        color='#1a0000'
    }

    return color;
}

function display() {
    countries.forEach(country=>{
        const total = country.totalConfirmed || 0;
        const active = country.totalConfirmed-country.totalRecovered-country.totalDeaths || 0;
        const recovered = country.totalRecovered || 0;
        const death = country.totalDeaths || 0;
        const popup = makePopup(country,total,active,recovered,death);
        let color = getColor(total);
        var marker = new mapboxgl.Marker({
            draggable: false,
            color:color,
        })
        .setLngLat([country.long, country.lat])
        .addTo(map)
        .setPopup(popup)
        markerArray.push(marker)
        
    });
    let showCountry = document.querySelector('.show-countries');
    let showStat = document.querySelector('.fa-chart-bar');
    let statContainer = document.querySelector('.country-stat');
    let close = document.querySelector('.fa-times:nth-of-type(1)');
    let update = document.querySelector('.country-stat p span');
    update.innerText = data.lastUpdated;
    update.style.color = 'orangered'
    close.addEventListener('click',()=>{
        statContainer.classList.remove('a')
    })

    showStat.addEventListener('click',()=>{
        statContainer.classList.add('a')
    })
    countries.forEach((country,index)=>{
        showCountry.innerHTML += `
            <div class="detail" data-index="${index}">
                <img src="./image/${country.displayName}.png">
                <div class="data">
                    <h3>${country.displayName}</h3>
                    <p><span style="color:orangered;">${country.totalConfirmed} </span> total cases.</>
                </div>
                <div><i class="fas fa-arrow-circle-right"></i></div>
            </div>
            <hr>
        `;
    })
    let datas = document.querySelectorAll('.detail');
    let state = document.querySelector('.state');
    datas.forEach(data=>{
        data.addEventListener('click',(event)=>{
            const index = event.target.dataset.index;
            map.flyTo({ center :[countries[index].long,countries[index].lat],zoom:5 });
            var popup = makePopup(countries[index],countries[index].totalConfirmed,countries[index].totalConfirmed-countries[index].totalDeaths-countries[index].totalRecovered,countries[index].totalRecovered,countries[index].totalDeaths)
                                                                                        .setLngLat([countries[index].long,countries[index].lat])
                                                                                        .addTo(map);
            state.innerHTML = `<h2 class="state-title">State Data (${countries[index].displayName})</h2>
            <i class="fas fa-times"></i>`
            stateMarkerArray.forEach(marker=>{
                marker.remove();
            })
            countries[index].areas.forEach(state=>{
                let color = getColor(state.totalConfirmed);
                let popup = makePopup(state,state.totalConfirmed || 0,state.totalConfirmed-state.totalDeaths-state.totalRecovered || 0,state.totalRecovered 
                    || 0 ,state.totalDeaths || 0);
                var stateMarker = new mapboxgl.Marker({
                    draggable: false,
                    color:color,
                })
                .setLngLat([state.long, state.lat])
                .addTo(map)
                .setPopup(popup)
                markerArray.push(stateMarker)
            })
            state.innerHTML += countries[index].areas.map(state=>{
                return `
                    <div class="state-detail">
                        <h3>${state.displayName}</h3>
                        <div class="state-data">
                            <p>Total  : &nbsp;<span>${state.totalConfirmed}</span></p>
                            <p>Recovered  : &nbsp;<span>${state.totalRecovered}</span></p>
                            <p>Deceased  : &nbsp;<span>${state.totalDeaths}</span></p>
                        </div>
                    </div>
                `
            }).join('')
            
            if(countries[index].areas.length === 0) {
                state.classList.remove('b');
            }else {
                state.classList.add('b');
                if(countries[index].areas[0].areas.length) {
                    console.log(countries[index].areas[0].areas.length);
                }
            }

            let close2 = document.querySelector('.state i');
            close2.addEventListener('click',()=>{
                state.classList.remove('b')
            })
        })
    })
}

window.addEventListener('click',(event)=>{
    let state = document.querySelector('.state');
    let country = document.querySelector('.country-stat')
    if(!(event.target===state || event.target===country || event.target.parentElement===state || event.target.parentElement===country || event.target.parentElement.parentElement===country || event.target.parentElement.parentElement===state || event.target.parentElement.parentElement.parentElement===state || event.target.parentElement.parentElement.parentElement.parentElement === state) && (state.classList.contains('b') && country.classList.contains('a'))) {
        console.log('jnh');
        state.classList.remove('b');
        country.classList.remove('a');
    }
})