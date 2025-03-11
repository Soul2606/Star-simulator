
const d_percent_bar_hydrogen_core = document.getElementById('percent-bar-hydrogen-core')
const d_percent_bar_helium_core = document.getElementById('percent-bar-helium-core')
const d_percent_bar_carbon_core = document.getElementById('percent-bar-carbon-core')
const d_percent_bar_hydrogen_all = document.getElementById('percent-bar-hydrogen-all')
const d_percent_bar_helium_all = document.getElementById('percent-bar-helium-all')
const d_percent_bar_carbon_all = document.getElementById('percent-bar-carbon-all')
const d_temperature_bar_below_hydrogen_fusion = document.getElementById('temperature-bar-below-hydrogen-fusion')




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
    if (min === undefined) {
        return Math.min(value, max)
    }
    if (max === undefined) {
        return Math.max(value, min)
    }
    return (Math.max(Math.min(value, max), min))
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




const chart_instances = {}
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
                


                const function_info_container_id = `function-display-container${index}`
                let function_info_container = document.getElementById(function_info_container_id)
                if (!function_info_container) {
                    function_info_container = document.createElement('div')
                    function_info_container.id = function_info_container_id
                    function_display_div.appendChild(function_info_container)
                }



                const function_name_id = `function-display-name${index}`
                let function_name = document.getElementById(function_name_id)
                if (!function_name) {
                    function_name = document.createElement('p')
                    function_name.id = function_name_id
                    function_info_container.appendChild(function_name)
                }
                function_name.textContent = key
                
                

                const canvas_id = `function-display-canvas${index}`
                let canvas = document.getElementById(canvas_id)
                if (!canvas) {                    
                    canvas = document.createElement('canvas')
                    canvas.id = canvas_id
                    function_info_container.appendChild(canvas)
                }

                if (chart_instances[canvas_id]) {
                    chart_instances[canvas_id].data.labels = labels
                    chart_instances[canvas_id].data.datasets[0].data = results
                    chart_instances[canvas_id].update()
                } else {
                    chart_instances[canvas_id] = new Chart(canvas, {
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

// Variables
let time = 10 ** 0
let average_density = 150000 //Kg/m3
let expansion_velocity = 0 //m/s
let core_temperature = 1.5e+8 //K

let hydrogen_mass = 1 * solar_mass //Kg
let helium_mass = 0 //Kg
let carbon_mass = 0 //Kg



const d_time_slider = document.getElementById('time_slider')
d_time_slider.addEventListener('input', ()=>{
    document.getElementById('time_label').textContent = d_time_slider.value / 10
    time = 10**(d_time_slider.value / 10)
})


setInterval(main, 100)
function main(){
    
    //Constants
    const mass = hydrogen_mass +  helium_mass + carbon_mass //Kg
    const radius = (mass / average_density * (3/(4*Math.PI))) ** (1/3) //m
    const surface_gravity = gravitational_constant * mass / radius ** 2 //m/s^2
    const core_mass_factor =  Math.min(max_fuel_available / ((mass / (solar_mass * 0.4)) ** 3), max_fuel_available) //This function approximates the fusion fuel availability for different classes of stars
    const core_mass = mass * core_mass_factor //Kg
    const surface_temperature = core_temperature / radius * 5000 //K. This is an approximation


    const temperature = (depth)=>{ //K
        depth = clamp(depth)
        return (core_temperature - surface_temperature) * depth ** 2 + surface_temperature
    }


    const density = (depth)=>{ //Kg/m3
        depth = clamp(depth)
        return average_density * depth ** 2
    }


    const pressure = (depth)=>{ //gigapascal 1 000 000 000N/m2
        depth = clamp(depth)
        return density(depth) * temperature(depth) / 1e+6 //Approximation to get the value to be close to the observed value in the sun
    }


    const hydrogen_fusion = (depth)=>{ //Watts
        depth = clamp(depth)
        return (density(depth) * relu(temperature(depth) - hydrogen_fusion_temperature_requirement)) * fusion_speed_multiplier
    }


    const helium_fusion = (depth)=>{ //Watts
        depth = clamp(depth)
        return (density(depth) * relu(temperature(depth) - helium_fusion_temperature_requirement)) * fusion_speed_multiplier
    }


    const fusion = (depth)=>{ //Watts
        depth = clamp(depth)
        return hydrogen_fusion(depth) + helium_fusion(depth)
    }


    core_temperature += fusion(1) * time / mass / 1e+9
    expansion_velocity += (pressure(1) / 1e+4 - surface_gravity) * time / 1e+10
    average_density -= expansion_velocity * time
    core_temperature -= expansion_velocity * (core_temperature / 10) * time


    display_variables({mass, average_density, radius, expansion_velocity, surface_gravity, core_mass, core_mass_factor, hydrogen_mass, helium_mass, carbon_mass})

    display_functions({temperature, density, pressure, hydrogen_fusion}, [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])

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
