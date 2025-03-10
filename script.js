
const d_percent_bar_hydrogen_core = document.getElementById('percent-bar-hydrogen-core')
const d_percent_bar_helium_core = document.getElementById('percent-bar-helium-core')
const d_percent_bar_carbon_core = document.getElementById('percent-bar-carbon-core')
const d_percent_bar_hydrogen_all = document.getElementById('percent-bar-hydrogen-all')
const d_percent_bar_helium_all = document.getElementById('percent-bar-helium-all')
const d_percent_bar_carbon_all = document.getElementById('percent-bar-carbon-all')
const d_temperature_bar_below_hydrogen_fusion = document.getElementById('temperature-bar-below-hydrogen-fusion')

const gravitational_constant = 6.67430e-11 //m^3 kg^-1 s^-2

const earth_atmosphere_mass = 5.148e+18 //Kg
const earth_ocean_mass = 1.4e+21 //Kg
const moon_mass = 7.34767e+22 //Kg
const earth_mass = 5.97219e+24 //Kg
const jupiter_mass = 1.898e+27 //Kg
const solar_mass = 1.9891e+30 //Kg

const ice_density = 900 //Kg/m^3
const hydrogen_fusion_temperature_requirement = 10 ** 8
const helium_fusion_temperature_requirement = 10 ** 9
const max_fuel_available = 0.9
const fusion_speed_multiplier = 5.1e+13
const density_change_damping = 10

let time = 10 ** 16
let mass = 1 * solar_mass //Kg
let average_density = 150000 //Kg/m3
let radius = (mass / average_density * (3/(4*Math.PI))) ** (1/3) //m
let surface_gravity = gravitational_constant * mass / radius ** 2 //m/s^2
let expansion_velocity = 0 //m/s

// Do not change these variables using any other method than the change_*variable*() function
let hydrogen_factor = 1 
let helium_factor = 0
let carbon_factor = 0

let core_temperature = 1.5e+8 //K
let core_mass_factor =  Math.min(0.9 / ((mass / (solar_mass * 0.4)) ** 3), 0.9) //This function approximates the fusion fuel availability for different classes of stars
let core_mass = mass * core_mass_factor //Kg




const temperature = (depth)=>{ //K
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    const surface_temperature = core_temperature / radius * 5000 //This is an approximation
    return (core_temperature - surface_temperature) * depth ** 2 + surface_temperature
}




const density = (depth)=>{ //Kg/m3
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    return average_density * depth ** 2
}




const pressure = (depth)=>{ //gigapascal 1 000 000 000N/m2
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    return density(depth) * temperature(depth) / 1e+6 //Approximation to get the value to be close to the observed value in the sun
}




const hydrogen_fusion = (depth)=>{ //Watts
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    return (density(depth) * relu(temperature(depth) - hydrogen_fusion_temperature_requirement)) * fusion_speed_multiplier
}




const helium_fusion = (depth)=>{ //Watts
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    return (density(depth) * relu(temperature(depth) - helium_fusion_temperature_requirement)) * fusion_speed_multiplier
}




const fusion = (depth)=>{ //Watts
    if (depth < 0 || depth > 1) {
        throw new Error("depth out of range", depth);
    }
    return hydrogen_fusion(depth) + helium_fusion(depth)
}
console.log(simplify(fusion(1)))




function relu(value){
    //rectified linear unit
    return Math.max(value, 0)
}




function simplify(value){
    const symbols = ['','k','m','b','t','qa','qi','sx','sp','oc','no','dec','und','dod','trd','qad','qid','sxd','spd','ocd','nod','vig']
    if(value == Infinity || isNaN(value)){
        throw new Error("bad value", value);
    }
    let times_divided = 0
    while(value >= 1000){
        value /= 1000
        times_divided++
    }
    return value.toFixed(relu(3 - String(Math.abs(Math.floor(value))).length)) + symbols[times_divided]
}




function simplify_by_stellar_masses(value, specify){
    if(typeof specify === 'number'){
        return (value / specify).toFixed(2)
    }
    if(value / solar_mass > 0.05){
        return (value / solar_mass).toFixed(2) + 's'
    }else if(value / jupiter_mass > 0.05){
        return (value / jupiter_mass).toFixed(2) + 'j'
    }else if(value / earth_mass > 0.05){
        return (value / earth_mass).toFixed(2) + 'e'
    }else if(value / moon_mass > 0.05){
        return (value / moon_mass).toFixed(2) + 'm'
    }else if(value / earth_ocean_mass > 0.05){
        return (value / earth_ocean_mass).toFixed(2) + 'eo'
    }else{
        return (value / earth_atmosphere_mass).toFixed(2) + 'ea'
    }
}




function clamp(value, min, max){
    if (min === undefined && max === undefined) {
        return Math.max(Math.min(value, 1), 0)
    }
    return (Math.max(Math.min(value, max), min))
}




function change_hydrogen(value){
    let hydrogen_mass = hydrogen_factor * mass
    let helium_mass = helium_factor * mass
    let carbon_mass = carbon_factor * mass
    hydrogen_mass += value
    mass += value
    hydrogen_factor = hydrogen_mass / mass
    helium_factor = helium_mass / mass
    carbon_factor = carbon_mass / mass
}




function change_helium(value){
    let helium_mass = helium_factor * mass
    let hydrogen_mass = hydrogen_factor * mass
    let carbon_mass = carbon_factor * mass
    helium_mass += value
    mass += value
    helium_factor = helium_mass / mass
    hydrogen_factor = hydrogen_mass / mass
    carbon_factor = carbon_mass / mass
}




function change_carbon(value){
    let helium_mass = helium_factor * mass
    let hydrogen_mass = hydrogen_factor * mass
    let carbon_mass = carbon_factor * mass
    carbon_mass += value
    mass += value
    helium_factor = helium_mass / mass
    hydrogen_factor = hydrogen_mass / mass
    carbon_factor = carbon_mass / mass
}




function display_variables(variables) {
    const variable_display_div = document.getElementById('variable-display')
    if (typeof variables === 'object') {
        for (const name in variables) {
            const value = variables[name];
            let name_display = document.getElementById(`variable-display-name-${name}`)
            let value_display = document.getElementById(`variable-display-value-${name}`)
            if (name_display === null) {
                name_display = document.createElement('p')
                name_display.textContent = name
                name_display.id = `variable-display-name-${name}`

                switch (typeof value) {
                    case 'number':
                        value_display = document.createElement('p')
                    break;
                    case 'string':
                        value_display = document.createElement('p')
                    break;
                    case 'object':
                        value_display = document.createElement('div')
                        value_display.className = 'value-display-grid'
                    default:
                        value_display = document.createElement('p')
                    break;
                }
                value_display.id = `variable-display-value-${name}`
                variable_display_div.innerHTML += `<br>`
                variable_display_div.appendChild(name_display)
                variable_display_div.appendChild(value_display)
            }
            switch (typeof value) {
                case 'number':
                    value_display.textContent = simplify(value)
                break;
                case 'string':
                    value_display.textContent = value
                break;
                case 'object':
                    const value_display_children = Array.from(value_display.children)
                    if (Array.isArray(value)) {
                        for (let index = 0; index < Math.max(value.length, value_display_children.length); index++) {
                            if (value_display_children[index]) {
                                value_display_children[index].textContent = value[index]
                            }else{
                                const paragraph = document.createElement('p')
                                paragraph.textContent = value
                                value_display.appendChild(paragraph)
                            }
                            if (value_display_children[index] && !value[index]) {
                                value_display_children[index].remove()
                                index--
                                continue
                            }
                        }
                    }else{
                        // I will work on this later
                    }
                break;
                default:
                    value_display.textContent = 'Err'
                break;
            }
        }
    }else{
        throw new Error("Invalid parameters");
        
    }
}




const chart_instance = {}
function display_functions(functions, parameter_values = [0,1]) {
    if (typeof functions === 'object' && (!Array.isArray(functions)) && Array.isArray(parameter_values)) {
        
        const function_display_div = document.getElementById('function-display')

        while (Array.from(function_display_div.children) > Object.entries(functions).length) {
            function_display_div.lastChild.remove()
        }

        let index = 0
        for(const key in functions){
            const function_reference = functions[key]
            if (typeof function_reference === 'function') {
                const labels = parameter_values
                const results = parameter_values.map(function_reference)
                const canvas_id = `function-display-canvas${index}`

                let canvas = document.getElementById(canvas_id)

                if (!canvas) {                    
                    canvas = document.createElement('canvas')
                    canvas.id = canvas_id
                    function_display_div.appendChild(canvas)
                }

                if (chart_instance[canvas_id]) {
                    chart_instance[canvas_id].data.labels = labels
                    chart_instance[canvas_id].data.datasets[0].data = results
                    chart_instance[canvas_id].update()
                } else {
                    chart_instance[canvas_id] = new Chart(canvas, {
                        type: 'line',
                        data:{
                            labels:labels,
                            datasets:[{
                                backgroundColor: 'rgba(0,0,255,1).0',
                                borderColor: 'rgba(255,255,255,1).0',
                                data:results
                            }]
                        },
                        options:{
                            legend: { display:false }
                        }
                    })
                }

            } else {
                throw new Error("Functions array contains a non function element",functions);
            }
            index++
        }
    }else{
        throw new Error("Invalid parameter",functions);
    }
}




const d_time_slider = document.getElementById('time_slider')
d_time_slider.addEventListener('input', ()=>{
    document.getElementById('time_label').textContent = d_time_slider.value / 10
    time = 10**(d_time_slider.value / 10)
})



setInterval(main, 100)



function main(){

    radius = (mass / average_density * (3/4/Math.PI)) ** (1/3) //m

    core_mass_factor =  Math.min(max_fuel_available / ((mass / (solar_mass * 0.4)) ** 3), max_fuel_available)
    core_mass = mass * core_mass_factor

    display_variables({mass, average_density, radius, surface_gravity, core_mass, core_mass_factor, hydrogen_factor, helium_factor, carbon_factor})

    display_functions({temperature, density}, [0,0.2,0.4,0.6,0.8,1])

    /*
    d_percent_bar_hydrogen_core.style.width = (hydrogen_in_core_factor * 100) + '%'
    d_percent_bar_helium_core.style.width = (helium_in_core_factor * 100) + '%'
    d_percent_bar_carbon_core.style.width = (carbon_in_core_factor * 100) + '%'
    d_percent_bar_hydrogen_all.style.width = (hydrogen_factor* 100) + '%'
    d_percent_bar_helium_all.style.width = (helium_factor* 100) + '%'
    d_percent_bar_carbon_all.style.width = (carbon_factor* 100) + '%'
    */
   {
       const radius = 45
       d_temperature_bar_below_hydrogen_fusion.style.width = Math.sqrt(hydrogen_fusion_temperature_requirement / core_temperature) * 100 + '%'
        document.getElementById('temperature-bar-label1').textContent = simplify(core_temperature * (radius - radius / 3 * 0) ** -2)
        document.getElementById('temperature-bar-label2').textContent = simplify(core_temperature * (radius - radius / 3 * 1) ** -2)
        document.getElementById('temperature-bar-label3').textContent = simplify(core_temperature * (radius - radius / 3 * 2) ** -2)
        document.getElementById('temperature-bar-label4').textContent = simplify(core_temperature)
   }
}
