var ComfyDB = require( "comfydb" );
var ComfyJS = require( "comfy.js" );
var fetch = require( "node-fetch" );
var Web = require( "webwebweb" );
Web.APIs[ "/location/search" ] = async ( qs, body, opts ) => {
	try {
		if( qs.username ) {
			let data = await ComfyDB.Search( { orderBy: "username", where: { username: { contains: qs.username } } }, "comfymap" );
			return data;
		}
	}
	catch( err ) {
		console.log( err );
	}
	return [];
};
Web.APIs[ "/everyone" ] = async ( qs, body, opts ) => {
	try {
		let data = await ComfyDB.Search( { orderBy: "username", limit: 100000 }, "comfymap" );
		return data;
	}
	catch( err ) {
		console.log( err );
	}
	return [];
};
Web.APIs[ "/locations" ] = async ( qs, body, opts ) => {
	try {
		let data = await ComfyDB.Search( { limit: 100000 }, "comfymap" );
		return data.map( x => ({
			location: x.location,
			locationName: x.locationName,
			lat: x.lat,
			lon: x.lon,
			createdAt: x.createdAt,
			updatedAt: x.updatedAt
		}));
	}
	catch( err ) {
		console.log( err );
	}
	return [];
};
async function addLocation( userId, username, location, displayName = "" ) {
	let data = await fetch( `https://nominatim.openstreetmap.org/?q=${location}&format=json&limit=1` ).then( r => r.json() );
	if( data && data.length > 0 ) {
		let profile = await fetch( `https://api.twitch.tv/kraken/users/${userId}`, {
			headers: {
				"Client-ID": "2odsv8xermvalbub7wipebrphqlpqv",
				"Accept": "application/vnd.twitchtv.v5+json",
			}
		} ).then( r => r.json() );
		// console.log( "profile:", profile );
		ComfyDB.Store( userId, {
			userId: userId,
			username: username,
			displayName: displayName || username,
			image: profile[ "logo" ],
			location: location,
			locationName: data[ 0 ].display_name,
			lat: data[ 0 ].lat,
			lon: data[ 0 ].lon,
		}, "comfymap" );
	}
	else {
		console.log( "Couldn't get location:", location );
	}
}
Web.Run( 43020 );
ComfyDB.Connect();
ComfyJS.onCommand = ( user, command, message, flags, extra ) => {
	if( command === "checkin" ) {
		// console.log( extra );
		addLocation( extra.userId, extra.username, message, extra.displayName );
	}
};
ComfyJS.Init( "instafluff" );
