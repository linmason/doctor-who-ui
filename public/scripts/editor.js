const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const load_doctors = () => {
    fetch(`/doctors`)
        .then(response => response.json())
        .then(data => {
            const doctor_templates = data.map(doctor => `
                <li>
                    <a data-id=${doctor._id}>${doctor.name}</a>
                </li>
            `)
            console.log(doctor_templates)
            const doctors_template = `
                <ul>
                    ${doctor_templates.join("")}
                </ul>
            `
            let doctors_elem = document.createElement('ul')
            doctors_elem.innerHTML = `${doctor_templates.join("")}`
            // document.querySelector("aside").prepend(doctors_elem)
            document.querySelector("aside").innerHTML = doctors_template
            init_create_doctor_button()
        })
        // add onclick events for each doctor
        .then( () => {
            for (let doctor_a of document.querySelectorAll("aside a")) {
                doctor_a.onclick = ev => {
                    load_doctor_page(ev.srcElement.dataset.id)
                    load_companions_page(ev.srcElement.dataset.id)
                }
            }
            // load_doctor_page(json_data._id)
        })
}

const load_doctor_page = (doctor_id) => {
    console.log("load doctor")
    document.querySelector("#companions").innerHTML = ``
    fetch(`/doctors/${doctor_id}`)
        .then(response => response.json())
        .then(data => {
            render_doctor(data)
        })
}

const render_doctor = (doctor_obj) => {
    let doctor_template = `
    <h3>${doctor_obj.name}</h3>
    <img src=${doctor_obj.image_url}>
    <p>Seasons: ${doctor_obj.seasons}</p>
    <button class="btn" id="edit" data-id=${doctor_obj._id}>edit</button>
    <button class="btn" id="delete" data-id=${doctor_obj._id}>delete</button>
    `
    document.querySelector("#doctor").innerHTML = doctor_template
    document.querySelector("#edit").onclick = ev => {
        load_doctor_edit(ev.srcElement.dataset.id)
    }
    document.querySelector("#delete").onclick = ev => {
        console.log("delete")
        delete_doctor(ev.srcElement.dataset.id)
    }
}


const load_doctor_edit = (doctor_id) => {
    fetch(`/doctors/${doctor_id}`)
        .then(response => response.json())
        .then(data => {
            load_form(patch_id=doctor_id)
            document.querySelector("#name").value = data.name
            document.querySelector("#seasons").value = data.seasons
            document.querySelector("#ordering").value = (data.ordering? data.ordering : "")
            document.querySelector("#image_url").value = (data.image_url? data.image_url : "")
        })
}

const delete_doctor = (doctor_id) => {
    let result = window.confirm("Delete This Doctor?")
    if (result) {
        fetch(`/doctors/${doctor_id}`,
            {
                method: 'delete',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        )
            .then(data => {
                console.log(data)
                load_doctors()
                document.querySelector("#doctor").innerHTML = `selected doctor goes here`
            })
    }
    else {
        load_doctor_page(doctor_id)
    }
}

const load_companions_page = (doctor_id) => {
    console.log("load companion")
    fetch(`/doctors/${doctor_id}/companions`)
        .then(response => {
            console.log(response)
            if (!response.ok) {document.querySelector("#companions").innerHTML = ``}
            else {return response.json()}
        })
        .then(data => {
            console.log(data)
            render_companions(data)
        })
}

const render_companions = (companion_objs) => {
    console.log(companion_objs)
    if (companion_objs == []) {
        console.log("no caompanions")
        document.querySelector("#companions").innerHTML = ``
        return
    }
    for (let companion_obj of companion_objs) {
        let companion_template = `
        <article>
            <img src=${companion_obj.image_url}>
            <h3>${companion_obj.name}</h3>
        </article>
        `
        document.querySelector("#companions").innerHTML = companion_template
    }
}

const init_create_doctor_button = () => {
    let button_template = `
    <button id="create-doctor-button">Create New Doctor
    </button>
    `
    document.querySelector("aside").innerHTML += button_template
    document.querySelector("#create-doctor-button").onclick = ev => {
        load_form()
        document.querySelector("#companions").innerHTML = ``
    }
}

const load_form = (patch_id=false) => {
    console.log("create form")
    const form_template = `
    <form>
        <!-- Name -->
        <label for="name">Name</label>
        <input type="text" id="name">

        <!-- Seasons -->
        <label for="seasons">Seasons</label>
        <input type="text" id="seasons">

        <!-- Ordering -->
        <label for="ordering">Ordering</label>
        <input type="text" id="ordering">

        <!-- Image -->
        <label for="image_url">Image</label>
        <input type="text" id="image_url">

        <!-- Buttons -->
        <button class="btn btn-main" id="create">Save</button>
        <button class="btn" id="cancel">Cancel</button>
    </form>
    `
    document.querySelector("#doctor").innerHTML = form_template
    document.querySelector("#create").onclick = ev => {
        //check for validity
        let name = document.querySelector("#name").value
        let seasons = document.querySelector("#seasons").value
        let seasons_list = []
        if (seasons) {seasons_list = seasons.split(',').map(Number)}
        let image_url = document.querySelector("#image_url").value
        let ordering = document.querySelector("#ordering").value
        if (check_form_validity(name, seasons_list, ordering)) {
            console.log("valid!")
            // call post function
            post_or_patch_new_doctor(name, seasons_list, ordering, image_url, patch_id)
            
            return false
        }

        else {
            console.log("invalid")
            let invalid_input_elem = document.createElement('p')
            invalid_input_elem.innerHTML = `invalid doctor info`
            document.querySelector("#doctor").prepend(invalid_input_elem)
            return false
        }
    }
    document.querySelector("#cancel").onclick = ev => {
        if (patch_id) {
            load_doctor_page(patch_id)
            return false
        }
        else {
            return true
        }
    }
}

const has_nan = (list) => {
    for (let num of list) {
        if (Number.isNaN(num)) {
            return false
        }
    }
    return true
}

const check_form_validity = (name, seasons_list, ordering) => {
    // queries the dom to check if nput is valid
    // return boolean of validity
    let has_name_and_seasons = name && seasons_list.length !=0 && has_nan(seasons_list)
    let ordering_is_num = Number(ordering) || !ordering
    if (has_name_and_seasons && ordering_is_num) {
        return true
    }
    else {
        return false
    }
}

const post_or_patch_new_doctor = (name, seasons, ordering, image_url, patch_id) => {
    let doctor_obj = {"name": name, "seasons": seasons}
    if (ordering) {doctor_obj["ordering"] = ordering}
    if (image_url) {doctor_obj["image_url"] = image_url}
    console.log(JSON.stringify(doctor_obj))
    let command = ''
    let address = ''
    if (patch_id) {
        command = 'PATCH'
        address = '/doctors/' + patch_id
    }
    else {
        command = 'POST'
        address = '/doctors'
    }
    console.log(command + " doctor")
    console.log(address)
    fetch(address, {
        method: command,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(doctor_obj)
    })
        .then(data => {
            data.json().then((json_data) => {
                console.log(json_data)
                load_doctors()
                load_doctor_page(json_data._id)
            })
        })
}





// invoke this function when the page loads:
initResetButton();
load_doctors();
