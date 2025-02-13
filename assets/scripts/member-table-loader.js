( function () {
    [
        ["Fives", 16253, "_5am_"],
        ["Nanamin", 301209, "nanamin"],
        ["Zniper", 146910, "zniper20"],
        ["Jyubei", 66055, "jyubei"],
        ["Z", 28381, "Zlare"],
        ["DeltaReckoner", 421412, "deltareckoner"],
        ["ClownHeli", 488121, "sneaky6540"],
        ["Shuvi", 775390, "exshuvi"],
        ["Nataly", 727922, "nathin1"],
        ["SHIDONī", 79276, "shidoni0216"],
        ["Vyntusius", 809631, "vyntusius"],
        ["Ain", 280464, "clockworkfigure"],
        ["Vargas", 1837372, "nanamin", "Nanamin's alt"],
        ["RUBEIDO", 41218, "rubeido"],
        ["Kairu", 466557, "xdkairu"],
        ["neonzaro", 968316, "N/A"],
        ["cupkate", 1470046, "cupkate"],
        ["Kelvin", 471754, "kelvinkhant"],
        ["Kayo", 456185, "_henkayo_"],
        ["mak0s", 16996, "mk0i"],
        ["Rooi", 53801, ".texastheomertosa"],
        ["Kuu Aro", 29548, "kuuaro"],
        ["UnJ", 137630, "N/A", "Kuu Aro's friend"],
        ["Khanwan00", 820342, "khanwan"],
        ["Aorinji", 981945, "aorinji"],
        ["Neip", 13003, "neepa"],
        ["Chin Chin", 51138, "chievic2030"],
        ["Cris", 124428, "stickwalker"],
    ].forEach( ( member, i ) => {
        var tr = document.createElement( "tr" );

        tr.insertCell().appendChild( document.createTextNode( i + 1 ) );

        // If the Notes column is missing, add a blank
        if ( member.length < 4 ) member.push( "" );

        member.forEach( item => {
            tr.insertCell().appendChild( document.createTextNode( item ) );
        });

        document.getElementById( "member-list-table" ).appendChild( tr );
    });
})();