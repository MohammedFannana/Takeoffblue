// <!--Start script from sidebar class -->

    //to make arrow-button is running to small and big sidebar
    document.addEventListener('DOMContentLoaded', function() {
        const sidebar = document.getElementById('sidebar');
        const measureSidebar = document.getElementById('measure-sidebar');
        const smallSidebar = document.getElementById('small-sidebar');
        const mainContent = document.getElementById('main-content');
        const arrowSidebarBtn = document.getElementById('arrow-sidebar-btn');
        const arrowSidebarBtn1 = document.getElementById('arrow-sidebar-btn1');

        const arrowSmallSidebarBtn = document.getElementById('arrow-small-sidebar-btn');

        arrowSidebarBtn.addEventListener('click', function() {
            sidebar.style.display = 'none';
            smallSidebar.style.display = 'block';
            mainContent.style.width = 'calc(100% - 30px)';
        });

        arrowSidebarBtn1.addEventListener('click', function() {
            measureSidebar.style.display = 'none';
            smallSidebar.style.display = 'block';
            mainContent.style.width = 'calc(100% - 30px)';
        });

        arrowSmallSidebarBtn.addEventListener('click', function() {
            smallSidebar.style.display = 'none';
            sidebar.style.display = 'block';
            // measureSidebar.style.display = 'block';
            mainContent.style.width = 'calc(100% - 400px)';
        });

    });

    //to show add information if the takeoff input is not empty and the create takeoff button is click

    document.addEventListener('DOMContentLoaded', function() {
        const taktoffNameInput = document.getElementById('taktoff_name');
        const createTakeoffButton = document.getElementById('create-takeoff');
        const startMeasuringButton = document.getElementById('start-measuring');
        const returnTakeoffButton = document.getElementById('return-takeoff');
        const addInformation = document.querySelector('.add-information');
        const notes = document.querySelector('.notes');

        // Initially disable the Create Takeoff button
        createTakeoffButton.disabled = true;

        // Enable the Create Takeoff button if taktoff_name input has data
        taktoffNameInput.addEventListener('input', function() {
            if (taktoffNameInput.value.trim() !== '') {
                createTakeoffButton.disabled = false;
            } else {
                createTakeoffButton.disabled = true;
            }
        });

        // Handle Create Takeoff button click
        createTakeoffButton.addEventListener('click', function() {
            if (taktoffNameInput.value.trim() !== '') {
                notes.style.display = 'none';
                createTakeoffButton.style.display = 'none';
                startMeasuringButton.style.display = 'block';
                returnTakeoffButton.style.display = 'block';
                addInformation.style.display = 'block';
            }
        });

        // Handle Return Takeoff button click
        returnTakeoffButton.addEventListener('click', function() {
            notes.style.display = 'block';
            createTakeoffButton.style.display = 'block';
            startMeasuringButton.style.display = 'none';
            addInformation.style.display = 'none';
        });
    });
        

    // to enable/disable the input verticalSwitch and horizontalSwitch based on the switch in apperance sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const switchInputs = document.querySelectorAll('.switch-input');
        const switchTextInputs = document.querySelectorAll('.switch-text');

        switchInputs.forEach((switchInput, index) => {
            switchInput.addEventListener('change', function() {
                switchTextInputs[index].disabled = !this.checked;
                if (this.checked) {
                    switchTextInputs[index].focus(); // Optionally focus on input when enabled
                }
            });
        });
    });


    // to enable/disable the Angel input  based on the verticalSwitch and horizontalSwitch in apperance sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const horizontalSwitch = document.getElementById('horizontalSwitch');
        const verticalSwitch = document.getElementById('verticalSwitch');
        const angleInput = document.querySelector('.angle-input');

        function updateAngleInput() {
            angleInput.disabled = !(horizontalSwitch.checked || verticalSwitch.checked);
        }

        horizontalSwitch.addEventListener('change', updateAngleInput);
        verticalSwitch.addEventListener('change', updateAngleInput);
    });



    //script for Tags Values in Tags sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const tagContainer = document.getElementById('label-container');
        const initialAddTagButton = document.getElementById('add-tag-button');
        const initialTagInput = tagContainer.querySelector('input[name="tag-value"]');

        // Add event listener to the initial Add button
        initialAddTagButton.addEventListener('click', function() {
            if (!initialTagInput.value.trim()) {
                return;
            }
            initialAddTagButton.style.display = 'none';
            initialAddTagButton.nextElementSibling.style.display = 'inline-block'; // Show delete button
            createNewTagContainer();
        });

        function createNewTagContainer() {
            // Create a new tag container
            const newTagContainer = document.createElement('div');
            newTagContainer.classList.add('label-container', 'd-flex', 'gap-1', 'mb-2');

            // Create a new input element
            const newTagInput = document.createElement('input');
            newTagInput.type = 'text';
            newTagInput.name = 'tag-value';
            newTagInput.classList.add('form-control');

            // Create an "Add" button
            const newAddTagButton = document.createElement('button');
            newAddTagButton.type = 'button';
            newAddTagButton.classList.add('btn');
            newAddTagButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                    <path fill="#028397" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"/>
                </svg>
            `;

            // Create a delete button
            const deleteTagButton = document.createElement('button');
            deleteTagButton.type = 'button';
            deleteTagButton.classList.add('btn');
            deleteTagButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                    <path fill="#028397" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>
                </svg>
            `;
            deleteTagButton.style.display = 'none';

            // Add delete functionality to the delete button
            deleteTagButton.addEventListener('click', function() {
                newTagContainer.remove();
            });

            // Add functionality to the "Add" button
            newAddTagButton.addEventListener('click', function() {
                if (!newTagInput.value.trim()) {
                    return;
                }
                // Hide the current "Add" button and show the "Delete" button
                newAddTagButton.style.display = 'none';
                deleteTagButton.style.display = 'inline-block';

                // Create a new tag container
                createNewTagContainer();
            });

            // Append the new input and buttons to the new tag-container
            newTagContainer.appendChild(newTagInput);
            newTagContainer.appendChild(newAddTagButton);
            newTagContainer.appendChild(deleteTagButton);

            // Append the new tag-container to the tag-container
            tagContainer.appendChild(newTagContainer);
        }
    });


    // script for items and assemblies in items & assemblies sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const tabItems = document.querySelectorAll('.item-model-content ul li');
        const itemsContent = document.querySelector('.items-content');
        const assembliesContent = document.querySelector('.assemblies-content');
    
        tabItems.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabItems.forEach(t => t.classList.remove('active'));
                
                // Add active class to the clicked tab
                tab.classList.add('active');
    
                // Show or hide content based on the clicked tab
                if (tab.getAttribute('data-target') === 'items-content') {
                    itemsContent.style.display = 'block';
                    assembliesContent.style.display = 'none';
                } else {
                    itemsContent.style.display = 'none';
                    assembliesContent.style.display = 'block';
                }
            });
        });
    });

    //script for label Values measure-takeoff-sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const tabLabels = document.querySelectorAll('.label-measure-content ul li');
        const itemsContent = document.querySelector('.label-project-content');
        const assembliesContent = document.querySelector('.label-library-content');
    
        tabLabels.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabLabels.forEach(t => t.classList.remove('active'));
                
                // Add active class to the clicked tab
                tab.classList.add('active');
    
                // Show or hide content based on the clicked tab
                if (tab.getAttribute('data-target') === 'label-project-content') {
                    itemsContent.style.display = 'block';
                    assembliesContent.style.display = 'none';
                } else {
                    itemsContent.style.display = 'none';
                    assembliesContent.style.display = 'block';
                }
            });
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const labelMeaureContainer = document.getElementById('label-measure-container');
        const initialAddLabelMeasureButton = document.getElementById('add-label-measure');
        const initialLabelInput = labelMeaureContainer.querySelector('input[name="label-value"]');

        // Add event listener to the initial Add button
        initialAddLabelMeasureButton.addEventListener('click', function() {
            if (!initialLabelInput.value.trim()) {
                return;
            }
            initialAddLabelMeasureButton.style.display = 'none';
            initialAddLabelMeasureButton.nextElementSibling.style.display = 'inline-block'; // Show delete button
            createNewLabelMeasureContainer();
        });

        function createNewLabelMeasureContainer() {
            // Create a new tag container
            const newLabelMeasureContainer = document.createElement('div');
            newLabelMeasureContainer.classList.add('label-container', 'd-flex', 'gap-1', 'mb-2');

            // Create a new input element
            const newLabelMeasureInput = document.createElement('input');
            newLabelMeasureInput.type = 'text';
            newLabelMeasureInput.name = 'tag-value';
            newLabelMeasureInput.classList.add('form-control');

            // Create an "Add" button
            const newAddLabelMeasuerButton = document.createElement('button');
            newAddLabelMeasuerButton.type = 'button';
            newAddLabelMeasuerButton.classList.add('btn');
            newAddLabelMeasuerButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                    <path fill="#028397" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"/>
                </svg>
            `;

            // Create a delete button
            const deleteLabelMeasuerButton = document.createElement('button');
            deleteLabelMeasuerButton.type = 'button';
            deleteLabelMeasuerButton.classList.add('btn');
            deleteLabelMeasuerButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                    <path fill="#028397" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>
                </svg>
            `;
            deleteLabelMeasuerButton.style.display = 'none';

            // Add delete functionality to the delete button
            deleteLabelMeasuerButton.addEventListener('click', function() {
                newLabelMeasureContainer.remove();
            });

            // Add functionality to the "Add" button
            newAddLabelMeasuerButton.addEventListener('click', function() {
                if (!newLabelMeasureInput.value.trim()) {
                    return;
                }
                // Hide the current "Add" button and show the "Delete" button
                newAddLabelMeasuerButton.style.display = 'none';
                deleteLabelMeasuerButton.style.display = 'inline-block';

                // Create a new tag container
                createNewLabelMeasureContainer();
            });

            // Append the new input and buttons to the new tag-container
            newLabelMeasureContainer.appendChild(newLabelMeasureInput);
            newLabelMeasureContainer.appendChild(newAddLabelMeasuerButton);
            newLabelMeasureContainer.appendChild(deleteLabelMeasuerButton);

            // Append the new tag-container to the tag-container
            labelMeaureContainer.appendChild(newLabelMeasureContainer);
        }
    });


    //script for copy in Copy in sidebar

    document.addEventListener('DOMContentLoaded', function() {
        const copyBtn = document.getElementById('copy-btn');
        const cancelBtn = document.getElementById('cancel-copy-content-btn');
        const sidebar = document.getElementById('sidebar');
        const copyContent = document.querySelector('.copy-content');

        copyBtn.addEventListener('click', function() {
            sidebar.style.display = 'none';
            copyContent.style.display = 'block';
        });

        cancelBtn.addEventListener('click', function() {
            copyContent.style.display = 'none';
            sidebar.style.display = 'block';
        });
    });

    // script for measure-takeoff-sidebar
    document.getElementById('start-measuring').addEventListener('click', function(event) {
        const startMeasuringBtn = event.target;
    
        if (startMeasuringBtn.hasAttribute('disabled')) {
            // Prevent the default action if the button is disabled
            event.preventDefault();
    
            // Show an alert
            alert('Please open a plan.');

        }else{
            document.getElementById('sidebar').style.display = 'none';
            document.getElementById('measure-sidebar').style.display = 'block';
        }
    });

    //Handle with measuring
    document.getElementById('return-takeoff-setting').addEventListener('click', function() {
        document.getElementById('measure-sidebar').style.display = 'none';
        document.getElementById('sidebar').style.display = 'block';
    });

    // Handle the unlock button click
    document.getElementById('unlock').addEventListener('click', function() {
        // Disable the multiplier input
        document.getElementById('multiplier').disabled = true;
        
        // Hide unlock-multiplier and show lock-multiplier
        document.getElementById('unlock-multiplier').style.display = 'none';
        document.getElementById('lock-multiplier').style.display = 'flex';
    });

    // Handle the lock button click
    document.getElementById('lock').addEventListener('click', function() {
        // Enable the multiplier input
        document.getElementById('multiplier').disabled = false;
        
        // Hide lock-multiplier and show unlock-multiplier
        document.getElementById('lock-multiplier').style.display = 'none';
        document.getElementById('unlock-multiplier').style.display = 'flex';
    });

    // handel with label in measure Sidebar


// <!--End script from sidebar class -->


// Start script from right sidebar class and show and hidden add scale button  -->


    document.addEventListener('DOMContentLoaded', function() {
        // Select the necessary elements
        const mainRightSidebar = document.getElementById('main-right-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const overviewLink = document.getElementById('li-overview-link');
        const imageCanvas = document.getElementById('container');
        const addNewScale = document.getElementById('add-scale');
        const startMeasuring = document.getElementById('start-measuring');
        const mainContent = document.getElementById('main-content');

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(handleStyleChange);

        // Configuration of the observer:
        const config = { attributes: true, attributeFilter: ['style'] };

        // Start observing the target node for configured mutations
        observer.observe(imageCanvas, config);

        // Function to show main-right-sidebar and hide right-sidebar
        function showMainRightSidebar() {

            mainRightSidebar.style.setProperty('display', 'flex', 'important');
            rightSidebar.style.setProperty('display', 'none', 'important');
            addNewScale.style.display ='none';
            startMeasuring.setAttribute('disabled', 'disabled');
            mainContent.style.setProperty('overflow' , 'auto');

        }

        // Function to hide main-right-sidebar and show right-sidebar
        function showRightSidebar() {
            mainRightSidebar.style.setProperty('display', 'none', 'important');
            rightSidebar.style.setProperty('display', 'flex', 'important');
            addNewScale.style.display ='flex';
            startMeasuring.removeAttribute('disabled');
            mainContent.style.setProperty('overflow' , 'visible');
        }

        // Event listener for overview-link
        overviewLink.addEventListener('click', () => {
            showMainRightSidebar();
        });


        // Function to handle changes
        function handleStyleChange(mutations) {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'style') {
                    const canvasStyle = window.getComputedStyle(imageCanvas);
                    if (canvasStyle.display === 'block') {
                        showRightSidebar();
                    }else{
                        showMainRightSidebar();
                    }
                }
            });
        }
    

    });

    // to make properties enable when check any image and change the properties 
    document.addEventListener('DOMContentLoaded', function() {
        const checkboxes = document.querySelectorAll('.checkbox');
        const properties = document.querySelectorAll('.main-right-sidebar .properties');
        const viewButtons = document.querySelectorAll('.view-btn');
        const mainRightSidebar = document.getElementById('main-right-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');

        function updateProperties() {
            let anyChecked = false;
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    anyChecked = true;
                }
            });

            properties.forEach(button => {
                if (anyChecked) {
                    button.disabled = false;
                    button.style.backgroundColor = '#555';
                    button.querySelector('span').style.color = 'white';
                    button.querySelector('svg path').style.fill = 'white';
                } else {
                    button.disabled = true;
                    button.style.backgroundColor = '';
                    button.querySelector('span').style.color = '#888';
                    button.querySelector('svg path').style.fill = '#888';
                }
            });
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateProperties);
        });

        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                mainRightSidebar.style.setProperty('display', 'none', 'important');
                rightSidebar.style.display = 'flex'; // or 'block', depending on your layout
            });
        });

        updateProperties(); // Initialize properties state on page load
    });


    //Start employment the Properties of the right sidebar 

    // start employment right and left rotate
        const checkboxes = document.querySelectorAll('.form-check-input');
        const rightRotateBtn = document.getElementById('right-rotate');
        const leftRotateBtn = document.getElementById('left-rotate');

        checkboxes.forEach(checkbox => {
            checkbox.rotation = 0; // Initialize rotation angle
        });

        function rotateImage(checkbox, angle) {
            const imagesDiv = checkbox.closest('.card').querySelector('.images');
            const img = imagesDiv.querySelector('img');
            
            if (img) {
                checkbox.rotation = (checkbox.rotation + angle) % 360; // Keep the rotation within 0-360 degrees
                let scale = 1;

                // Apply zoom out when the image is rotated top to bottom or bottom to top
                if (Math.abs(checkbox.rotation) === 90 || Math.abs(checkbox.rotation) === 270) {
                    scale = 0.8; // Adjust the scale value as needed
                }

                img.style.transform = `rotate(${checkbox.rotation}deg) scale(${scale})`;
            }
        }

        rightRotateBtn.addEventListener('click', () => {
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    rotateImage(checkbox, 90);
                }
            });
        });

        leftRotateBtn.addEventListener('click', () => {
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    rotateImage(checkbox, -90);
                }
            });
        });
    // End employment right and left rotate


    //  End employment the Properties of the right sidebar 


// End script from right sidebar class 

