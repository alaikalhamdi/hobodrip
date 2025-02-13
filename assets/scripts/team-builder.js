( function () {
    var DOLL_FOLDER = "assets/images/dolls/"
    var DOLLS_PER_TEAM = 5
    var NUMBER_OF_TEAMS = 3
    var PLACEHOLDER_IMG = "assets/images/placeholder.png"

    var state = {
        currentAccount: 0,
        dollSlots: [[], [], []],
        savedTeams: [{
            name: "Account 1",
            teams: [[], [], []]
        }],
        selectedDolls: [],
        selectedTeam: 0,
    }

    // ============================================================================================
    // = Functions
    // ============================================================================================

    /**
     * Generates the buttons for interacting with the modal to change accounts.
     * @param {jQuery} row The row to add this button to.
     */
    const generateAccountChangeButton = row => {
        const accountButton = $( "<button>", {
            "class": "btn btn-light col-2 offset-6 mt-3",
            "data-bs-target": "#account-swap-modal",
            "data-bs-toggle": "modal",
            type: "button"
        })
        accountButton.text( "Change Set" )
        row.append( accountButton )

        $( document ).ready( () => {
            $( "#account-swap-modal" ).find( ".btn-light" ).eq( 0 ).on( "click", () => {
                // Don't delete the last account
                if ( state.savedTeams.length <= 1 ) return

                state.savedTeams.pop()
                $( "#account-swap-modal" ).find( ".modal-body > .container-fluid" ).eq( state.savedTeams.length ).remove()

                if ( state.savedTeams.length < state.currentAccount ) {
                    state.currentAccount = 0
                    loadData( state.savedTeams[0].teams )
                }
            })

            $( "#account-swap-modal" ).find( ".btn-light" ).eq( 1 ).on( "click", () => {
                state.savedTeams.push({
                    name: "Account " + ( state.savedTeams.length + 1 ),
                    teams: [Array( 5 ).fill( "" ), Array( 5 ).fill( "" ), Array( 5 ).fill( "" )]
                })
                generateAccountSelector( state.savedTeams.length - 1 )
            })
        })
    }

    /**
     * Creates a selector for the given account.
     * @param {Number} n The index of the account.
     */
    const generateAccountSelector = n => {
        const container = $( "<div>", { "class": "container-fluid p-3 rounded " + ( n === 0 ? "bg-primary" : "mt-2 bg-secondary" ) } )
        const selector = $( "<div>", { "class": "form-floating" })
        const field = $( "<input>", {
            "class": "form-control",
            id: "account-name-input-" + n,
            placeholder: "Account " + ( n + 1 ),
            type: "text",
            value: state.savedTeams[n].name
        })
        const label = $( "<label>", { for: "account-name-input-" + n } )

        field.on( "change", function ( event ) {
            state.savedTeams[n].name = $( event.target ).val()
        })
        field.on( "click", event => event.stopPropagation() )

        container.on( "click", function ( event ) {
            if ( state.currentAccount === n ) return;

            // When swapping to another account, we need to save the current one
            Object.assign( state.savedTeams[state.currentAccount], { teams: getTeamsOnlyDolls() } )

            // Swap the coloring over
            $( "#account-swap-modal" )
                .find( ".modal-body > .container-fluid" )
                .eq( state.currentAccount )
                .removeClass( "bg-primary" )
                .addClass( "bg-secondary" )
            $( "#account-swap-modal" )
                .find( ".modal-body > .container-fluid" )
                .eq( n )
                .removeClass( "bg-secondary" )
                .addClass( "bg-primary" )

            state.currentAccount = n

            // Load the selected account's teams
            loadData( state.savedTeams[n].teams )

            // Reset which dolls have been selected so far to match the current set's teams
            state.selectedDolls = [...new Set( state.savedTeams[n].teams.flat() )]

            $( "#doll-list" ).find( "img" ).each( function () {
                if ( state.selectedDolls.includes( getDollName( $( this ).attr( "src" ) ) ) ) {
                    $( this ).addClass( "opacity-25" )
                } else {
                    $( this ).removeClass( "opacity-25" )
                }
            })
        })

        label.text( "Set " + ( n + 1 ) )
        selector.append( field )
        selector.append( label )
        container.append( selector )
        $( "#account-swap-modal" ).find( ".modal-body" ).append( container )
    }

    /**
     * Generates the image + caption combinations for each doll.
     */
    const generateDollSelectors = () => {
        let row;

        getDollNames().forEach( ( doll, i ) => {
            // 4 columns per row
            if ( i % 4 === 0 ) {
                row = $( "<div>", { "class": "row" } )
                $( "#doll-list" ).append( row )
            }

            let cell = $( "<div>", { "class": "col-md-3" } )
            let figure = $( "<figure>", { "class": "figure" } )

            let img = $( "<img>", { "class": "img-fluid rounded mx-auto d-block user-select-none bg-secondary", src: DOLL_FOLDER + doll + ".png" } )
            let figcaption = $( "<figcaption>", { "class": "figure-caption text-center user-select-none" } ).text( doll )

            cell.append( figure )

            figure.append( img )
            figure.append( figcaption )

            row.append( cell )

            $( img ).on( "click", ( event ) => {
                const lastDoll = state.dollSlots[state.selectedTeam].at( -1 ).find( "img" )

                // If the team is full, don't add another
                if ( !lastDoll.attr( "src" ).includes( "placeholder" ) ) return;

                const doll = getDollName( event.target.src )

                // There are two reasons we can allow a selection:
                // * They haven't been selected yet
                // * They're being chosen as a support
                //
                // If they're being chosen as a support, we can determine if that is possible based on whether the resulting team
                // would have three dolls that are in another team. This is because 2 dolls can trade the support slot, but 3 is
                // just not possible.
                const teamSelections = getSelectedTeams()

                if ( teamSelections[state.selectedTeam].includes( doll ) ) return;

                for ( let i = 0; i < NUMBER_OF_TEAMS; i++ ) {
                    const intersections = teamSelections[state.selectedTeam]
                        .concat( doll )
                        .filter( d => teamSelections[i].includes( d ) && d !== "placeholder" )

                    if ( i === state.selectedTeam ) {
                        continue
                    } else if ( intersections.length >= 3 || hasTooManyDupes( teamSelections.flat().concat( doll ) ) ) {
                        return
                    }
                }

                const firstEmpty = state.dollSlots[state.selectedTeam]
                    .filter( el => el.find( "img" ).attr( "src" ).includes( "placeholder" ) )
                    .at( 0 )
                    .children()
                const img = firstEmpty.children( "img" )
                const figcaption = firstEmpty.children( "figcaption" )

                img.attr( "src", DOLL_FOLDER + doll + ".png" )
                figcaption.text( doll )

                state.selectedDolls.push( doll )
                $( event.target ).addClass( "opacity-25" )
            })
        })
    }

    /**
     * Generates the buttons for interacting with the modal to import/export data.
     * @param {jQuery} row The row to add this button to.
     */
    const generateImportExportModalButton = row => {
        const saveButton = $( "<button>", {
            "class": "btn btn-light col-2 mt-3 ms-3",
            "data-bs-target": "#import-export-modal",
            "data-bs-toggle": "modal",
            type: "button"
        })
        saveButton.text( "Import/Export" )
        row.append( saveButton )

        saveButton.on( "click", () => {
            $( "#import-export-modal" ).find( "textarea" ).val( JSON.stringify( getTeamsOnlyDolls() ) )
        })

        $( "#import-export-modal" ).find( ".modal-footer > .btn-secondary" ).on( "click", () => {
            navigator.clipboard.writeText( JSON.stringify( getTeamsOnlyDolls() ) )
            bootstrap.Toast.getOrCreateInstance( $( "#copied-to-clipboard-toast" )[0] ).show()
        })

        $( "#import-export-modal" ).find( ".modal-footer > .btn-primary" ).on( "click", () => {
            try {
                loadData( JSON.parse( $( "#import-export-modal" ).find( "textarea" ).val() ) )
            } catch ( err ) {
                window.alert( err )
            }
        })
    }

    /**
     * Creates the initial state of the team boxes on the right.
     */
    const generateInitialState = () => {
        for ( let i = 0; i < NUMBER_OF_TEAMS; i++ ) {
            let container = $( "<div>", { "class": "container-fluid col-8 bg-secondary rounded mt-2 pt-4 pe-4 team-box" } )
            let row = $( "<div>", { "class": "row" } )
            let teamLabel = $( "<div>", { "class": "col-2 d-flex justify-content-center align-items-center" } )
            let labelFormat = $( "<span>", { "class": "text-center fw-bold pb-3 user-select-none" } )
            let dollBox = $( "<div>", { "class": "col-2" } )
            let figure = $( "<figure>", { "class": "figure" } )
            let img = $( "<img>", { "class": "img-fluid rounded mx-auto d-block user-select-none", src: PLACEHOLDER_IMG, alt: "Empty" } )
            let figcaption = $( "<figcaption>", { "class": "figure-caption text-center user-select-none" } )

            if ( i === 0 ) {
                container.removeClass( "bg-secondary" )
                container.addClass( "bg-primary" )
            }

            dollBox.on( "click", event => {
                const teamBox = $( event.target ).parents( "figure" )
                const doll = getDollName( teamBox.children( "img" ).attr( "src" ) )
                const clickedIndex = state.dollSlots[state.selectedTeam]
                    .findIndex( el => getDollName( el.find( "img" ).attr( "src" ) ) === doll )

                for ( let i = clickedIndex; i < DOLLS_PER_TEAM; i++ ) {
                    const currentSlot = state.dollSlots[state.selectedTeam][i]

                    if ( !currentSlot ) continue

                    const img = currentSlot.find( "img" )
                    const figcaption = currentSlot.find( "figcaption" )

                    if ( i >= DOLLS_PER_TEAM - 1 ) {
                        // If we're on the last slot, there is no next slot to copy over
                        img.attr( "src", PLACEHOLDER_IMG )
                        figcaption.text( "" )
                    } else {
                        // Copy the next slot's values over
                        const nextSlot = state.dollSlots[state.selectedTeam][i + 1]
                        img.attr( "src", nextSlot.find( "img" ).attr( "src" ) )
                        figcaption.text( nextSlot.find( "figcaption" ).text() )
                    }

                    // Find the doll in the selector and remove the opacity change
                    const listImg = Object.values( $( "#doll-list" ).find( "img" ) )
                        .find( el => getDollName( el.src ) === doll )

                    // Because a doll can be present in multiple teams if they're a support, we need to only remove the opacity
                    // filter if they're gone from every team
                    if ( !getSelectedTeams().flat().includes( doll ) ) {
                        $( listImg ).removeClass( "opacity-25" )

                        // Reset the doll's selected status
                        state.selectedDolls = state.selectedDolls.filter( name => name !== doll )
                    }
                }
            })

            figure.append( img )
            figure.append( figcaption )
            dollBox.append( figure )

            teamLabel.append( labelFormat )
            labelFormat.text( "Team " + ( i + 1 ) )

            row.append( teamLabel )

            for ( let j = 0; j < DOLLS_PER_TEAM; j++ ) {
                let clone = dollBox.clone( true )
                state.dollSlots[i].push( clone )
                row.append( clone )
            }

            container.append( row )

            container.on( "click", event => {
                $( ".team-box" ).removeClass( "bg-primary" ).addClass( "bg-secondary" )
                state.selectedTeam = i;
                $( event.target ).parents( ".team-box" ).removeClass( "bg-secondary" ).addClass( "bg-primary" )
            })

            $( "#team-roster" ).append( container )
        }
    }

    /**
     * Removes the path elements and extension.
     * @param {String} pathname The image source string to parse.
     * @returns {String}
     */
    const getDollName = pathname => {
        return pathname.split( "/" ).at( -1 ).replace( ".png", "" )
    }

    /**
     * Gets the dolls that have images in the folder. This is hard-coded because Github Pages doesn't provide a folder view and
     * there's an API request limit on the alternative. While it's unlikely we'd go over 5k requests/hr, it's just better to not 
     * open the risk, since somebody could refresh spam.
     * @returns {String[]}
     */
    const getDollNames = () => {
        return [
            "Andoris",
            "Belka",
            "Centaureissi",
            "Cheeta",
            "Colphne",
            "Daiyan",
            "Dushevnaya",
            "Faye",
            "Groza",
            "Jiangyu",
            "Klukai",
            "Krolik",
            "Ksenia",
            "Lenna",
            "Littara",
            "Lotta",
            "Makiatto",
            "Mechty",
            "Mosin-Nagant",
            "Nagant",
            "Nemesis",
            "Papasha",
            "Peri",
            "Peritya",
            "Qiongjiu",
            "Qiuhua",
            "Sabrina",
            "Sharkry",
            "Springfield",
            "Suomi",
            "Tololo",
            "Ullrid",
            "Vector",
            "Vepley",
            "Zhaohui",
        ]
    }

    /**
     * Resolves the DOM elements into which dolls they currently represent.
     * @returns {String[][]}
     */
    const getSelectedTeams = () => {
        return state.dollSlots.map( team => {
            return team.map( figure => getDollName( figure.find( "img" ).attr( "src" ) ) )
        })
    }

    /**
     * Retrieves the doll names without "placeholder" in any array index.
     * @returns {String[][]}
     */
    const getTeamsOnlyDolls = () => {
        return state.dollSlots
            .map( team => {
                return team.map( figure => {
                    const name = getDollName( figure.find( "img" ).attr( "src" ) )

                    if ( name === "placeholder" ) return ""
                    else return name
                })
            })
    }

    /**
     * Determines whether there is more than one doll that is part of 3 teams. This should not be possible. The input array is
     * expected to have the doll added, so it will be 1 longer than the actual state.
     * @param {String[]} arr The flattened array of doll names that have been selected (appear in the team boxes).
     * @returns {Boolean}
     */
    const hasTooManyDupes = arr => {
        let count = {}
        arr
            .filter( value => value !== "placeholder" )
            .forEach( value => count[value] = count[value] ? count[value] + 1 : 1 )
        return Object.values( count ).filter( n => n >= 3 ).length > 1
    }

    /**
     * Loads data into the team builder.
     * @param {String[][]} data The teams data to load.
     */
    const loadData = data => {
        for ( let a = 0; a < NUMBER_OF_TEAMS; a++ ) {
            for ( let b = 0; b < DOLLS_PER_TEAM; b++ ) {
                if ( data[a][b] ) {
                    state.dollSlots[a][b].find( "img" ).attr( "src", DOLL_FOLDER + data[a][b] + ".png" )
                    state.dollSlots[a][b].find( "figcaption" ).text( data[a][b] )

                    const listImg = Object.values( $( "#doll-list" ).find( "img" ) )
                        .find( el => getDollName( el.src ) === data[a][b] )

                    $( listImg ).addClass( "opacity-25" )
                } else {
                    state.dollSlots[a][b].find( "img" ).attr( "src", PLACEHOLDER_IMG )
                    state.dollSlots[a][b].find( "figcaption" ).text( "" )
                }
            }
        }
    }

    // ============================================================================================
    // = Actual execution
    // ============================================================================================

    generateDollSelectors()
    generateInitialState()

    // Modal buttons
    const row = $( "<div>", { "class": "row" } )
    generateAccountChangeButton( row )
    generateImportExportModalButton( row )
    $( "#team-roster" ).append( row )

    // Handle the storage
    $( window ).on( "beforeunload", () => {
        // Update the current team before saving the teams
        Object.assign( state.savedTeams[state.currentAccount], { teams: getTeamsOnlyDolls() } )
        localStorage.setItem( "hobodrip.teambuilder", JSON.stringify( state.savedTeams ) )
    })

    $( document ).ready( () => {
        let data = localStorage.getItem( "hobodrip.teambuilder" )

        if ( data ) {
            const parsedData = JSON.parse( data )

            // Convert legacy data to the new format
            if ( data && typeof data[0][0] === "string" ) {
                data = JSON.stringify([{
                    name: "Account 1",
                    teams: data
                }])
            }

            state.savedTeams = parsedData

            // Just load the first account's teams
            loadData( parsedData[0].teams )

            // Generate the selectors for the accounts in the modal
            for ( let i = 0; i < parsedData.length; i++ ) {
                generateAccountSelector( i )
            }
        }
    })
})()