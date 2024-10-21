
const d_mass = document.getElementById("mass")
const d_density = document.getElementById("density")
const d_fusion = document.getElementById("fusion")
const d_core_temperature = document.getElementById("core_temperature")
const d_core_pressure = document.getElementById("inwards_core_pressure")
const d_core_mass_factor = document.getElementById("core_mass_factor")
const d_core_mass = document.getElementById("core_mass")
const d_hydrogen_mass = document.getElementById("hydrogen_mass")
const d_helium_mass = document.getElementById("helium_mass")
const d_carbon_mass = document.getElementById('carbon_mass')
const d_hydrogen_factor = document.getElementById("hydrogen_factor")
const d_helium_factor = document.getElementById("helium_factor")
const d_carbon_factor = document.getElementById("carbon_factor")
const d_percent_bar_hydrogen_core = document.getElementById('percent-bar-hydrogen-core')
const d_percent_bar_helium_core = document.getElementById('percent-bar-helium-core')
const d_percent_bar_carbon_core = document.getElementById('percent-bar-carbon-core')
const d_percent_bar_hydrogen_all = document.getElementById('percent-bar-hydrogen-all')
const d_percent_bar_helium_all = document.getElementById('percent-bar-helium-all')
const d_percent_bar_carbon_all = document.getElementById('percent-bar-carbon-all')
const d_temperature_bar_below_hydrogen_fusion = document.getElementById('temperature-bar-below-hydrogen-fusion')


const earth_atmosphere_mass = 5.148e+18 //Kg
const earth_ocean_mass = 1.4e+21 //Kg
const moon_mass = 7.34767e+22 //Kg
const earth_mass = 5.97219e+24 //Kg
const jupiter_mass = 1.898e+27 //Kg
const solar_mass = 1.9891e+30 //Kg

const ice_density = 900 //Kg/m^3
const hydrogen_fusion_temperature_requirement = 10 ** 7
const helium_fusion_temperature_requirement = 10 ** 9
const max_fuel_available = 0.9
const fusion_speed_divider = 10 ** 1
const density_change_damping = 10

let time = 10 ** 16
let mass = 1 * solar_mass

// Do not change these variables using any other method than the change_*variable*() function
let hydrogen_factor = 1 
let helium_factor = 0
let carbon_factor = 0

let hydrogen_fusion = 0
let helium_fusion = 0
let core_temperature = 10 ** 8
let inwards_core_pressure = mass
let core_mass_factor =  Math.min(0.9 / ((mass / (solar_mass * 0.4)) ** 3), 0.9)
let core_mass = mass * core_mass_factor
let density = solar_mass



function relu(value){
    //rectified linear unit
    return Math.max(value, 0)
}



function simplify(value){
    const symbols = ['','k','m','b','t','qa','qi','sx','sp','oc','no','dec','und','dod','trd','qad','qid','sxd','spd','ocd','nod','vig']
    if(value == Infinity || isNaN(value)){
        console.warn('bad value', value)
        return 0
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




const d_time_slider = document.getElementById('time_slider')
d_time_slider.addEventListener('input', ()=>{
    document.getElementById('time_label').textContent = d_time_slider.value / 10
    time = 10**(d_time_slider.value / 10)
})



setInterval(main, 100)



function main(){

    inwards_core_pressure = mass
    core_mass_factor =  Math.min(max_fuel_available / ((mass / (solar_mass * 0.4)) ** 3), max_fuel_available)
    core_mass = mass * core_mass_factor

    
    let hydrogen_in_core_factor = relu(clamp(hydrogen_factor,0,core_mass_factor) - helium_factor - carbon_factor) / core_mass_factor
    hydrogen_fusion = relu(core_temperature - hydrogen_fusion_temperature_requirement) * hydrogen_in_core_factor / fusion_speed_divider


    let helium_in_core_factor = clamp(helium_factor / core_mass_factor,0,1-carbon_factor)
    helium_fusion = relu(core_temperature - helium_fusion_temperature_requirement) * helium_in_core_factor / fusion_speed_divider


    let carbon_in_core_factor = relu(carbon_factor / core_mass_factor)

    let fusion = hydrogen_fusion + helium_fusion

    core_temperature = (mass / solar_mass * 10**7.1 - fusion)
    density = ice_density / Math.log(core_temperature)

    change_hydrogen(-(hydrogen_fusion * time))
    change_helium(hydrogen_fusion * time)


    change_helium(-(helium_fusion * time))
    change_carbon(helium_fusion * time)


    {
    d_mass.textContent = simplify_by_stellar_masses(mass)
    d_density.textContent = simplify(density)
    d_fusion.textContent = simplify(hydrogen_fusion + helium_fusion)
    d_core_temperature.textContent = simplify(core_temperature)
    d_core_pressure.textContent = simplify(inwards_core_pressure)
    d_core_mass_factor.textContent = core_mass_factor
    d_core_mass.textContent = simplify_by_stellar_masses(core_mass)
    d_hydrogen_mass.textContent = simplify_by_stellar_masses(hydrogen_factor * mass)
    d_helium_mass.textContent = simplify_by_stellar_masses(helium_factor * mass)
    d_carbon_mass.textContent = simplify_by_stellar_masses(carbon_factor * mass)
    d_hydrogen_factor.textContent = hydrogen_factor.toFixed(2)
    d_helium_factor.textContent = helium_factor.toFixed(2)
    d_carbon_factor.textContent = carbon_factor.toFixed(2)
    d_percent_bar_hydrogen_core.style.width = (hydrogen_in_core_factor * 100) + '%'
    d_percent_bar_helium_core.style.width = (helium_in_core_factor * 100) + '%'
    d_percent_bar_carbon_core.style.width = (carbon_in_core_factor * 100) + '%'
    d_percent_bar_hydrogen_all.style.width = (hydrogen_factor* 100) + '%'
    d_percent_bar_helium_all.style.width = (helium_factor* 100) + '%'
    d_percent_bar_carbon_all.style.width = (carbon_factor* 100) + '%'

    d_temperature_bar_below_hydrogen_fusion.style.width = Math.sqrt(hydrogen_fusion_temperature_requirement / core_temperature) * 100 + '%'
    const radius = 45
    document.getElementById('temperature-bar-label1').textContent = simplify(core_temperature * (radius - radius / 3 * 0) ** -2)
    document.getElementById('temperature-bar-label2').textContent = simplify(core_temperature * (radius - radius / 3 * 1) ** -2)
    document.getElementById('temperature-bar-label3').textContent = simplify(core_temperature * (radius - radius / 3 * 2) ** -2)
    document.getElementById('temperature-bar-label4').textContent = simplify(core_temperature)
    }
}
