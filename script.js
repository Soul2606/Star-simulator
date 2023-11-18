
const d_mass = document.getElementById("mass")
const d_density = document.getElementById("density")
const d_fusion = document.getElementById("fusion")
const d_core_temp = document.getElementById("core_temp")
const d_core_pressure = document.getElementById("inwards_core_pressure")
const d_core_size = document.getElementById("core_size")
const d_core_mass = document.getElementById("core_mass")
const d_hydrogen_mass = document.getElementById("hydrogen_mass")
const d_helium_mass = document.getElementById("helium_mass")
const d_hydrogen_factor = document.getElementById("hydrogen_factor")
const d_helium_factor = document.getElementById("helium_factor")
const d_carbon_factor = document.getElementById("carbon_factor")


const jupiter_mass = 1.898e+27 //Kg
const solar_mass = 1.9891e+30 //Kg

const ice_density = 900 //Kg/m^3
const hydrogen_fusion_pressure_requirement = solar_mass * 0.1
const helium_fusion_pressure_requirement = solar_mass * 0.5
const max_fuel_available = 0.9
const fusion_speed_divider = 120000000000000000
const density_change_damping = 10
const fusion_pressure_exertion = 10000000000000000

let time = 10 ** 0
let mass = 1 * solar_mass

// Do not change these variables using any other method than the change_*variable*() function
let hydrogen_factor = 1 
let helium_factor = 0
let carbon_factor = 0

let hydrogen_fusion = 0
let helium_fusion = 0
let core_temp = mass
let inwards_core_pressure = mass - hydrogen_fusion
let core_size =  Math.min(0.9 / ((mass / (solar_mass * 0.4)) ** 3), 0.9)
let core_mass = mass * core_size
let density = 900



function clamp(value, min, max){
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



setInterval(main, 100)



function main(){
    let available_hydrogen = clamp((1 - ((1 - core_size) + helium_factor + carbon_factor)), 0, 1)
    hydrogen_fusion += ((inwards_core_pressure - hydrogen_fusion_pressure_requirement) * available_hydrogen) / fusion_speed_divider
    hydrogen_fusion = Math.max(hydrogen_fusion, 0)


    let available_helium = clamp(1 - ((1 - core_size) + carbon_factor), 0, 1)
    helium_fusion += ((inwards_core_pressure - helium_fusion_pressure_requirement) * available_helium) / fusion_speed_divider
    helium_fusion = Math.max(helium_fusion, 0)


    inwards_core_pressure += ((mass - (hydrogen_fusion * fusion_pressure_exertion)) - inwards_core_pressure) / 100
    core_temp = (hydrogen_fusion + inwards_core_pressure) / 120000000000000000000000
    core_size =  Math.min(max_fuel_available / ((mass / (solar_mass * 0.4)) ** 3), max_fuel_available)
    core_mass = mass * core_size
    density += ((ice_density / Math.max((core_temp / 100), 1)) - density) / density_change_damping
    

    change_hydrogen(-(hydrogen_fusion * time))
    change_helium(hydrogen_fusion * time)


    change_helium(-(helium_fusion * time))
    change_carbon(helium_fusion * time)


    {
    d_mass.textContent = mass
    d_density.textContent = density
    d_fusion.textContent = hydrogen_fusion + helium_fusion
    d_core_temp.textContent = core_temp
    d_core_pressure.textContent = inwards_core_pressure
    d_core_size.textContent = core_size
    d_core_mass.textContent = core_mass
    d_hydrogen_mass.textContent = (hydrogen_factor * mass)
    d_helium_mass.textContent = (helium_factor * mass)
    d_hydrogen_factor.textContent = hydrogen_factor
    d_helium_factor.textContent = helium_factor
    d_carbon_factor.textContent = carbon_factor
    }
}
