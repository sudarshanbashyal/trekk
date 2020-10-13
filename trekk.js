const inputs=(function(){

    // SET EVERYTHING TO DISPLAY NONE
    const container=document.querySelector('.container');
    container.style.display='none';
    
    const compareContainerDetails=document.querySelector('.compare-graph-container');
    const compareContainerCurrency=document.querySelector('.compare-details-container');
    compareContainerDetails.style.display='none';
    compareContainerCurrency.style.display='none';

    // EVENT LISTENER AND TAKING INPUT
    document.addEventListener('keypress',(event)=>{

        if(event.keyCode===13){
            
            // PASS INPUT INTO THE DETAILS MODULE
            const inputValue=document.querySelector('.location-input').value;
            details(inputValue);
            weatherGraph(inputValue);

            // TAKE COMPARE INPUT
            const compareButton=document.querySelector('.compare-button');
            compareButton.addEventListener('click',()=>{
                
                // TAKE COMPARING VALUE
                const compareInputValue=document.querySelector('.compare-input').value;
                // CHECK IF VALUE IS NULL
                if(compareInputValue!=''){

                    // PASS INTO COMPARE FUNCTION
                    compareCities(inputValue,compareInputValue);

                }

            })
        }

    })

})()


const details=function(input){


    // SET THE IMAGE FROM PIXABAY API
    fetch(`https://pixabay.com/api/?key=16292834-e1dab577def99ba2b6c76099a&q=${input}&image_type=photo&pretty=true&max_width="2000"&max_height="2000"`)
    .then(res=>{
        return res.json();
    })
    .then(data=>{

        // SET PRIMARY IMAGE
        const imageBackground=document.querySelector('.desc-container .image');
        imageBackground.style.backgroundImage=`url(${data.hits[0].largeImageURL})`;

    })

    // SET THE DESCRIPTION TEXT
    fetch(`https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&redirects=1&titles=${input}`)
    .then(res=>{
        return res.json();
    })
    .then(data=>{
        // EXTRACT THE PARAGRAPH FROM JSON OBJECT
        const pages=data.query.pages;
        var paragraph=Object.values(pages)[0].extract;
        
        // MAKE THE PARAGRAPH SHORTER
        var maxLength=1500;
        var trimmedPara='';

        if(paragraph.length>trimmedPara.length){
            trimmedPara=paragraph.substr(0,maxLength);
            trimmedPara=trimmedPara.substr(0, Math.min(trimmedPara.length, trimmedPara.lastIndexOf(" ")));
        }

        trimmedPara+='....</p>';

        // GET PARAGRAPH ELEMENT AND DISPLAY TEXT
        const descriptionParagraph=document.querySelector('.description p');
        descriptionParagraph.innerHTML=trimmedPara;
        const container=document.querySelector('.container');
        container.style.display='block';

        // SET THE HEADING OF THE PAGE
        const heading=document.querySelector('.description .heading');
        heading.textContent=input;
        heading.style.textTransform='capitalize';

        // SET THE FULL WIKI LINK
        const learnMore=document.querySelector('.description a');
        learnMore.setAttribute('href',`https://en.wikipedia.org/wiki/${input}`);
        learnMore.setAttribute('target','_blank');
    
    })


    // GET ALL THE DETAILS FROM OpenCageData API
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${input}&key=fad97931dd5646b3943512062d96136c&limit=1`)
    .then(res=>{
        return res.json();
    })
    .then(data=>{
        // PASS THE COORDINATES INTO MAP FUNCTION
        const coordinates=data.results[0].geometry;
        map(coordinates);

        // GIVE FULL DETAILS
        displayDetails(data);

        // CALL THE CURRENCY GRAPH
        currencyGraph(data.results[0].annotations.currency.iso_code);
    })


    // MAP FUNCTION
    const map=(coordinates)=>{

        const container=document.querySelector('.container');
        container.style.display='block';

        const mapContainer=document.querySelector('#map');
        mapContainer.innerHTML='';

        var map = new ol.Map({
            target: 'map',
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM()
              })
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([coordinates.lng, coordinates.lat]),
              zoom: 10
            })
        });

    }

    // DETAILS FUNCTION
    const displayDetails=(data)=>{
        var measure='Imperial';
        if(data.results[0].annotations.roadinfo.speed_in==='km/h'){
            measure='Metric'
        }

        let detailList=document.querySelector('.details ul');
        let list=`<li>Location: ${data.results[0].formatted}</li>
                    <li>Latitude: ${data.results[0].annotations.DMS.lat}</li>
                    <li>Longitude: ${data.results[0].annotations.DMS.lng}</li>
                    <li>TImezone: UTC ${data.results[0].annotations.timezone.offset_string}</li>
                    <li>Currency: ${data.results[0].annotations.currency.name}</li>
                    <li>Measurement: ${measure}</li>`
        detailList.innerHTML=list;
        
    }


}


// WEATHER GRAPH
const weatherGraph=function(input){


    // FETCHING WEATHER
    const locationWeather=(function(){
        return fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/historysummary?aggregateHours=24&collectStationContributions=false&maxStations=-1&maxDistance=-1&minYear=1989&maxYear=2019&chronoUnit=months&breakBy=self&dailySummaries=false&contentType=json&unitGroup=us&locationMode=single&key=ZTV3ALI0391GN5DFM7EQBTPMN&locations=${input}`)
        .then(res=>{
            return res.json()
        })
        .then(data=>{
            return(data.location.values);
        })
    })();

    weatherArray={
        weather:[]
    }

    locationWeather.then(data=>{
        data.forEach(element=>{
            weatherArray.weather.push(element.temp);
        })

        let myChart=document.querySelector('.weather-chart').getContext('2d');
        myChart.innerHTML='';

        Chart.defaults.global.defaultFontSize=16;
        Chart.defaults.global.defaultFontColor='black';

        let weatherChart=new Chart(myChart,{

            type:'line',
            data:{
                labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'],
                datasets:[{
                    label:`Temp. of ${input} in 2019`,
                    data:weatherArray.weather,
                    borderWidth:2,
                    backgroundColor: 'transparent',
                    borderColor:'#ff6384',
                    hoverBorderWidth:2
                }
            ]
            },
            
        });
    })    

}


const currencyGraph=function(currency){

    // ARRAY FOR CURRENCIES
    var exchange;
    // FETCHING CURRENCY DETAILS

    const exchangeRate=(function(){
        fetch(`https://fcsapi.com/api-v2/forex/base_latest?symbol=${currency}&type=forex&access_key=x7ojQbPTgyT4HZYbvdGgZvBVOsFcOMvphJQ49PSgkPs4IYgkhR`)
        .then(res=>{
            return res.json();
        })
        .then(data=>{
            exchange= [
                data.response.USD,
                data.response.AUD,
                data.response.EUR,
                data.response.GBP,
            ]

            let currChart=document.querySelector('.currency-chart').getContext('2d');
            currChart.innerHTML='';

            Chart.defaults.global.defaultFontSize=16;
            Chart.defaults.global.defaultFontColor='black';

            let weatherChart=new Chart(currChart,{

                type:'bar',
                data:{
                    labels:['USD','AUD','EUR','GBP'],
                    datasets:[{
                        label:`${currency} Exchange Rates`,
                        data:exchange,
                        borderWidth:2,
                        backgroundColor: '#f7cf6b',
                        borderColor:'#f7cf6b',
                        hoverBorderWidth:2
                    }
                ]
                },
                
            });
            
        })
    })();
    
}

const compareCities=function(firstCity,secondCity){
    
    // DISPLAY THE CITY YOU ARE COMARPING TO
    const compareHeading=document.querySelector('.comparing-to');
    compareHeading.textContent=`Comparing ${firstCity} to ${secondCity}.`

    // DISPLAY COMPARE CONTAINERS
    const compareContainerDetails=document.querySelector('.compare-graph-container');
    const compareContainerCurrency=document.querySelector('.compare-details-container');
    compareContainerDetails.style.display='flex';
    compareContainerCurrency.style.display='flex';

    // DETAILS API 
    const compareDetails=(function(){

        // FIRST CITY DETAILS
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${firstCity}&key=fad97931dd5646b3943512062d96136c&limit=1`)
        .then(res=>{
            return res.json();
        })
        .then(data=>{

            let measure='Imperial';
            if(data.results[0].annotations.roadinfo.speed_in==='km/h'){
                measure='Metric'
            }

            let detailList=document.querySelector('.first-city-details ul');
            let list=`<li>Location: ${data.results[0].formatted}</li>
                        <li>Latitude: ${data.results[0].annotations.DMS.lat}</li>
                        <li>Longitude: ${data.results[0].annotations.DMS.lng}</li>
                        <li>TImezone: UTC ${data.results[0].annotations.timezone.offset_string}</li>
                        <li>Currency: ${data.results[0].annotations.currency.name}</li>
                        <li>Measurement: ${measure}</li>`
            detailList.innerHTML=list;
        })

        // SECOND CITY DETAILS
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${secondCity}&key=fad97931dd5646b3943512062d96136c&limit=1`)
        .then(res=>{
            return res.json();
        })
        .then(data=>{

            let measure='Imperial';
            if(data.results[0].annotations.roadinfo.speed_in==='km/h'){
                measure='Metric'
            }

            let detailList=document.querySelector('.second-city-details ul');
            let list=`<li>Location: ${data.results[0].formatted}</li>
                        <li>Latitude: ${data.results[0].annotations.DMS.lat}</li>
                        <li>Longitude: ${data.results[0].annotations.DMS.lng}</li>
                        <li>TImezone: UTC ${data.results[0].annotations.timezone.offset_string}</li>
                        <li>Currency: ${data.results[0].annotations.currency.name}</li>
                        <li>Measurement: ${measure}</li>`
            detailList.innerHTML=list;
        })

    })()


    // WEATHER API
    const fetchWeather=(function(){

        // FETCHING KATHMANDU WEATHER HISTORY
        let first=function(){
            return fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/historysummary?aggregateHours=24&collectStationContributions=false&maxStations=-1&maxDistance=-1&minYear=1989&maxYear=2019&chronoUnit=months&breakBy=self&dailySummaries=false&contentType=json&unitGroup=us&locationMode=single&key=P4FVI758HALTIDFITVEXTV2W7&locations=${firstCity}`)
            .then(res=>{
                return res.json()
            })
            .then(data=>{
                return(data.location.values);
            })
        }
        
        // FETCHING butwal WEATHER HISTORY
        let second=function(){
            return fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/historysummary?aggregateHours=24&collectStationContributions=false&maxStations=-1&maxDistance=-1&minYear=1989&maxYear=2019&chronoUnit=months&breakBy=self&dailySummaries=false&contentType=json&unitGroup=us&locationMode=single&key=P4FVI758HALTIDFITVEXTV2W7&locations=${secondCity}`)
            .then(res=>{
                return res.json()
            })
            .then(data=>{
                return(data.location.values);
            })
        }
    
        return{
            first:first,
            second:second
        }
    
    })()
    
    
    const chartData=(function(){
    
        var climateData={
            firstClimate:[],
            secondClimate:[]
        };
    
        let first=fetchWeather.first().then(data=>{
            data.forEach(element=>{
                climateData.firstClimate.push(element.temp);
            })
        })
        let second=fetchWeather.second().then(data=>{
            data.forEach(element=>{
                climateData.secondClimate.push(element.temp);
            })

            let myChart=document.querySelector('.compare-weather').getContext('2d');
            myChart.innerHTML='';
            let popChart=new Chart(myChart,{
        
                type:'line',
                data:{
                    labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'],
                    datasets:[{
                        label:`Temp. of ${firstCity} in 2019`,
                        data:climateData.firstClimate,
                        borderWidth:2,
                        backgroundColor:'transparent',
                        borderColor:'rgba(255,99,132,0.9)',
                        hoverBorderWidth:2,
                        hoverBorderColor:'black'
                    },
                    {
                        label:`Temp. of ${secondCity} in 2019`,
                        data:climateData.secondClimate,
                        backgroundColor:'transparent',
                        borderWidth:2,
                        borderColor:'rgba(105,209,62,0.9)',
                        hoverBorderWidth:2,
                        hoverBorderColor:'black'
                    }
                ]
                },
                
            });
        })
    
    })()  
    
    
    // CURRENCY API
    const fetchCurrency=(function(){

        const firstCurrency=(function(){

            return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${firstCity}&key=fad97931dd5646b3943512062d96136c&limit=1`)
            .then(res=>{
                return res.json();
            })
            .then(data=>{
                // CALL THE FIRST CURRENCY FUNCTION
                return (data.results[0].annotations.currency.iso_code);
            })

        })()

        const secondCurrency=(function(){

            return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${secondCity}&key=fad97931dd5646b3943512062d96136c&limit=1`)
            .then(res=>{
                return res.json();
            })
            .then(data=>{
                // CALL THE FIRST CURRENCY FUNCTION
                return (data.results[0].annotations.currency.iso_code);
            })

        })()

        return{
            firstCurrency:firstCurrency,
            secondCurrency:secondCurrency
        }

    })()
    
    
    const displayCurrency=(function(){

        var firstExchange;
        var secondExchange;
        // GET EXCHANGE RATES FOR FIRST CURRENCY
        fetchCurrency.firstCurrency
        .then(data=>{
            fetch(`https://fcsapi.com/api-v2/forex/base_latest?symbol=${data}&type=forex&access_key=x7ojQbPTgyT4HZYbvdGgZvBVOsFcOMvphJQ49PSgkPs4IYgkhR`)
            .then(res=>{
                return res.json();
            })
            .then(curr=>{
                firstExchange=[curr.response.USD,
                                curr.response.AUD,
                                curr.response.EUR,
                                curr.response.GBP]

                // GET EXCHANGE RATES FOR SECOND CURRENCY
                fetchCurrency.secondCurrency
                .then(data=>{
                    fetch(`https://fcsapi.com/api-v2/forex/base_latest?symbol=${data}&type=forex&access_key=x7ojQbPTgyT4HZYbvdGgZvBVOsFcOMvphJQ49PSgkPs4IYgkhR`)
                    .then(res=>{
                        return res.json();
                    })
                    .then(curr=>{
                        
                        secondExchange=[curr.response.USD,
                                        curr.response.AUD,
                                        curr.response.EUR,
                                        curr.response.GBP]

                        // MAKE THE GRAPH
                        let currChart=document.querySelector('.compare-currency').getContext('2d');
                        currChart.innerHTML='';

                        Chart.defaults.global.defaultFontSize=16;
                        Chart.defaults.global.defaultFontColor='black';

                        let compareChart=new Chart(currChart,{

                            type:'bar',
                            data:{
                                labels:['USD','AUD','EUR','GBP'],
                                datasets:[{
                                    label:`Exchange rate in ${firstCity}`,
                                    data:firstExchange,
                                    borderWidth:2,
                                    backgroundColor: '#f7cf6b',
                                    borderColor:'#f7cf6b',
                                    hoverBorderWidth:2
                                },
                                {
                                    label:`Exchange rate in ${secondCity}`,
                                    data:secondExchange,
                                    borderWidth:2,
                                    backgroundColor: '#36a2eb',
                                    borderColor:'#36a2eb',
                                    hoverBorderWidth:2
                                } 
                            ]
                            },
                            
                        });

                    })
                })
            })

        })        

    })()
}