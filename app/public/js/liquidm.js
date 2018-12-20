/**
 * LIQUIDM Require modules
 */
const axios = require('axios');

/**
 * LIQUIDM Document Ready
 */
$(document).ready(function() {      
    
    // Content Hide
    $("#campaignJSONselected").hide();
    $("#campaignLoad").hide();
    $("#header-phone").hide();
    $("#loader").hide();
    $("#form_getcampaign").hide();
    $("#form_postnewad").hide();
    $("#form_posttargeting").hide();
    
    // Tables Hide
    $("#campaignLinesTable").hide();
    $("#targetingTable").hide();
    $("#supplyTable").hide();
    $("#creativeTable").hide();
    $("#settingsTable").hide();

});

// Functions
// Unique ID generator
function Generator_Campaigns() {};
Generator_Campaigns.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator_Campaigns.prototype.getId = function() {
    return this.rand++;
};
var idGen_Campaigns = new Generator_Campaigns();
function Generator_Lines() {};
Generator_Lines.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator_Lines.prototype.getId = function() {
    return this.rand++;
};
var idGen_Lines = new Generator_Lines();
// Deepest Child
$.fn.findDeepest = function() {
    var results = [];
    this.each(function() {
        var deepLevel = 0;
        var deepNode = this;
        treeWalkFast(this, function(node, level) {
            if (level > deepLevel) {
                deepLevel = level;
                deepNode = node;
            }
        });
        results.push(deepNode);
    });
    return this.pushStack(results);
};
var treeWalkFast = (function() {
    // create closure for constants
    var skipTags = {"SCRIPT": true, "IFRAME": true, "OBJECT": true, "EMBED": true};
    return function(parent, fn, allNodes) {
        var node = parent.firstChild, nextNode;
        var level = 1;
        while (node && node != parent) {
            if (allNodes || node.nodeType === 1) {
                if (fn(node, level) === false) {
                    return(false);
                }
            }
            // if it's an element &&
            //    has children &&
            //    has a tagname && is not in the skipTags list
            //  then, we can enumerate children
            if (node.nodeType === 1 && node.firstChild && !(node.tagName && skipTags[node.tagName])) {                
                node = node.firstChild;
                ++level;
            } else if (node.nextSibling) {
                node = node.nextSibling;
            } else {
                // no child and no nextsibling
                // find parent that has a nextSibling
                --level;
                while ((node = node.parentNode) != parent) {
                    if (node.nextSibling) {
                        node = node.nextSibling;
                        break;
                    }
                    --level;
                }
            }
        }
    }
})();
// Resize textarea for API answers
function textAreaAdjust(o) {
  o.style.height = "1px";
  o.style.height = (25+o.scrollHeight)+"px";
}

// Events
// Click btnShowLines
$(document).on('click', ".btnShowLines", function() {
    var campaignIDFilter = $(this).parent().parent().parent().attr('campaignsTableID');
    //console.log('Parent campaignsTableID: ',campaignIDFilter);
    var hideLinesFilter = $(".campaignLinesTableWrapper tbody tr").filter(function(){
        let boolFilterHide = $(this).attr('data-label') !== campaignIDFilter;
        //console.log($(this).attr('data-label') + '!==' + campaignIDFilter + ':' + boolFilterHide);
        return boolFilterHide;
    }).hide();
    //console.log('hideLinesFilter: ',hideLinesFilter);
    var campaignLinesTableFilter = $(".campaignLinesTableWrapper tbody tr").filter(function(){
        let boolLinesFilter = $(this).attr('data-label') == campaignIDFilter;
        //console.log('data-label: ',$(this).attr('data-label'));
        return boolLinesFilter;
    }).show();
    //console.log('campaignLinesTableFilter: ',campaignLinesTableFilter);
    $("#campaignLinesTable").show();
    $("#targetingTable").hide();
    $("#supplyTable").hide();
    $("#creativeTable").hide();
    $("#settingsTable").hide();  
});
// Click btnShowTargeting
$(document).on('click', ".btnShowTargeting", function() {
    console.log('btnShowTargeting clicked');
    console.log($(this).parent().parent().parent().parent().attr('campaignLinesTableID'));
    var lineDetailsTableIDFilter = $(this).parent().parent().parent().parent().attr('campaignLinesTableID');
    console.log('lineDetailsTableIDFilter: ',lineDetailsTableIDFilter);
    // Deleting outer square brackets
    //JSON.stringify($("#targetingTable tr td:empty").filter(function(){ return false })).replace(/^\[|]$/g, '');
    /**
    $("#targetingTable tr td").findDeepest().filter(function(){ 
        console.log('this.html before: ',$(this).html().trim());
        let parser = new DOMParser;
        let dom = parser.parseFromString(
            '<!doctype html><body>' + $(this).html().trim(),
            'text/html');
        let deepestHTMLText = dom.body.textContent;
        console.log('deepestHTMLText: ',deepestHTMLText);
        let boolEmptyFilter = deepestHTMLText !== '';
        let boolMatchFilter = deepestHTMLText.replace(/^\[|]$/g, '') !== deepestHTMLText;
        console.log('boolEmptyFilter: ',boolEmptyFilter);
        console.log('boolMatchFilter: ',boolMatchFilter);
        if (!boolEmptyFilter) { 
            $(this).text('-'); 
        } else if (boolMatchFilter) {
            $(this).text(deepestHTMLText.replace(/^\[|]$/g, '')); 
            if ($(this).html == '') { $(this).text('-') };
            console.log('this.html after: ',$(this).html().trim());
        };
        return boolEmptyFilter;
    }); */
    // Replace blank for '-'
    $("#targetingTable tr td:empty").text('-');
    // Beautify geo_locations
    var geolocations = $('.wrap-geolocations').filter(function(){
        let boolFilterGeo = $(this).attr('data-label') == lineDetailsTableIDFilter;
        //console.log($(this).attr('data-label') + '!==' + lineDetailsTableIDFilter + ':' + boolFilterGeo);
        return boolFilterGeo;
    }).text();
    $('.wrap-geolocations').html(geolocations.replace(/\},/g, '},<br/>'));
    //console.log($('.wrap-geolocations').text());

    // Filter by lineDetailsTableIDFilter
    var hideDetailsFilter = $("#targetingTable tr td").filter(function(){
        let boolFilterLabel = $(this).attr('data-label') !== lineDetailsTableIDFilter;
        let boolFilterSection = $(this).attr('data-label') !== 'section-heading';
        let boolFilterHide = boolFilterLabel * boolFilterSection;
        //console.log('#boolFilterLabel:: ' + $(this).attr('data-label') + '!==' + lineDetailsTableIDFilter + ':' + boolFilterLabel);
        //console.log('#boolFilterSection:: ' + $(this).attr('data-label') + '!==section-heading' + ':' + boolFilterSection);
        //console.log('#boolFilterHide:: ' + 'boolFilterHide = ' + boolFilterLabel + ' * ' + boolFilterSection + ': ' + boolFilterHide);
        return boolFilterHide;
    }).hide();
    //console.log('hideDetailsFilter: ',hideDetailsFilter);
    var detailsTableFilter = $("#targetingTable tr td").filter(function(){
        let boolFilterLabel = $(this).attr('data-label') == lineDetailsTableIDFilter;
        let boolFilterSection = $(this).attr('data-label') == 'section-heading';
        let boolDetailsFilter = boolFilterLabel || boolFilterSection;
        //console.log('#boolFilterLabel:: ' + $(this).attr('data-label') + '==' + lineDetailsTableIDFilter + ':' + boolFilterLabel);
        //console.log('#boolFilterSection:: ' + $(this).attr('data-label') + '==section-heading' + ':' + boolFilterSection);
        //console.log('#boolDetailsFilter:: ' + 'boolDetailsFilter = ' + boolFilterLabel + ' OR ' + boolFilterSection + ': ' + boolDetailsFilter);
        return boolDetailsFilter;
    }).show();
    //console.log('detailsTableFilter: ',detailsTableFilter);

    // Show only selected column
    $("#targetingTable").show();
    $("#supplyTable").hide();
    $("#creativeTable").hide();
    $("#settingsTable").hide();
});
// Click btnShow
$(document).on('click', ".btnShow", function() {

    $("#supplyTable tr td:empty").text('-');
    $("#supplyTable").show();
    $("#targetingTable").hide();
    $("#creativeTable").hide();
    $("#settingsTable").hide();
});
// Click btnShow
$(document).on('click', ".btnShow", function() {

    $("#creativeTable tr td:empty").text('-');
    $("#creativeTable").show();
    $("#targetingTable").hide();
    $("#supplyTable").hide();
    $("#settingsTable").hide();
});
// Click btnShow
$(document).on('click', ".btnShow", function() {

    $("#settingsTable tr td:empty").text('-');
    $("#settingsTable").show();
    $("#targetingTable").hide();
    $("#supplyTable").hide();
    $("#creativeTable").hide();
});

// Form
//  || $('#creative-upload').get(0).files.length === 0
$('#uploadForm').submit(function() {
    if ($('#creative-upload').get(0).files.length === 0) {
        console.log("No files selected.");
        return false;
    } else {
        return true;
    }
});
// Campaign file JSON
$("#file-submit").click(function () {
    
	var files = document.getElementById('file-upload').files;
    console.log(files);
    if (files.length <= 0) {
      return false;
    }
    
    var fr = new FileReader();
    
    fr.onload = function(e) { 
        console.log(e);
        var result = JSON.parse(e.target.result);
        var formatted = JSON.stringify(result, null, 2);
        document.getElementById('campaignJSONselected').value = formatted;

        const linesPosition = '<td class=\"pt-3-half\"><span class=\"table-up\"><a href=\"#!\" class=\"indigo-text\"><i class=\"fa fa-arrow-up\" aria-hidden=\"true\"></i></a></span><span class=\"table-down\"><a href=\"#!\" class=\"indigo-text\"><i class=\"fa fa-arrow-down\" aria-hidden=\"true\"></i></a></span></td>';
        console.log('linesPosition: ',linesPosition);

        // Populate Tables
        result.campaigns.forEach(function(campaignsKey, campaignsEntry){
            console.log('result.campaigns[key]: ',campaignsKey);
            console.log('campaignsEntry:', campaignsEntry);

            let campaignsTableID = idGen_Campaigns.getId();
            console.log('campaignsTableID: ',campaignsTableID); 

            let campaigns_tr = '<tr data-label=\"' + campaignsKey.id + '\" campaignID=\"' + campaignsKey.id + '\" campaignName=\"' + campaignsKey.name + '\" campaignsTableID=\"' + campaignsTableID + '\">';

            let campaigns_th = '<th scope=\"row\"><input class=\"form-check-input\" type=\"checkbox\" id=\"checkbox' + campaignsEntry + 
            '\"><label class=\"form-check-label\" for=\"checkbox' + campaignsEntry + '\" class=\"label-table\"></label></th>';
            console.log('campaigns_th: ',campaigns_th);

            let btnShowLines = '<td><span><a id=\"btnShowLines' + campaignsEntry + 
                '\" href=\"#!\" class=\"btnShowLines indigo-text\"><i class=\"fa fa-eye\" aria-hidden=\"true\"></i></a></span></td>';
            console.log('btnShowLines: ',btnShowLines);

            let campaignsRow = campaigns_tr + campaigns_th +
                '<td>' + campaignsKey.account_id + '</td>' +
                '<td>' + campaignsKey.id + '</td>' +
                '<td>' + campaignsKey.name + '</td>' +
                '<td>' + campaignsKey.timezone + '</td>' +
                '<td>' + campaignsKey.currency + '</td>' +
                '<td>' + Object.keys(campaignsKey.ads).length + '</td>' +
                '<td>' + 'Pending' + '</td>' + btnShowLines +
            '</tr>';
            console.log('campaignsRow: ',campaignsRow);

            // Campaigns Table
            $('#campaignsTable tbody').append(campaignsRow);

            // Lines Table
            campaignsKey.ads.forEach(function(adsKey, adsEntry){
                console.log('campaignsKey.ads[key]: ',adsKey);
                console.log('adsEntry:', adsEntry);

                let campaignLinesTableID = idGen_Lines.getId();
                console.log('campaignLinesTableID: ',campaignLinesTableID)

                let ads_tr = '<tr data-label=\"' + campaignsTableID + 
                    '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" adsName=\"' + adsKey.name + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + '\">';
                console.log('ads_tr: ',ads_tr);

                let ads_th = '<th scope=\"row\"><input class=\"form-check-input\" type=\"checkbox\" id=\"checkbox' + adsEntry + 
                '\"><label class=\"form-check-label\" for=\"checkbox' + adsEntry + '\" class=\"label-table\"></label></th>';
                console.log('ads_th: ',ads_th);

                let btnShowTargeting = '<td class=\"pt-3-half\"><span class=\"table-up\"><a href=\"#!\" class=\"indigo-text\"><i id=\"btnShowTargeting' + adsEntry + 
                    '\" class=\"btnShowTargeting fa fa-angle-down\" aria-hidden=\"true\"></i></a></span></td>';
                console.log('btnShowTargeting: ',btnShowTargeting);

                let btnShowSupply = '<td class=\"pt-3-half\"><span class=\"table-up\"><a href=\"#!\" class=\"indigo-text\"><i id=\"btnShowSupply' + adsEntry + 
                    '\" class=\"btnShowSupply fa fa-angle-down\" aria-hidden=\"true\"></i></a></span></td>';
                console.log('btnShowSupply: ',btnShowSupply);

                let btnShowCreative = '<td class=\"pt-3-half\"><span class=\"table-up\"><a href=\"#!\" class=\"indigo-text\"><i id=\"btnShowCreative' + adsEntry + 
                    '\" class=\"btnShowCreative fa fa-angle-down\" aria-hidden=\"true\"></i></a></span></td>';
                console.log('btnShowCreative: ',btnShowCreative);

                let btnShowSettings = '<td class=\"pt-3-half\"><span class=\"table-up\"><a href=\"#!\" class=\"indigo-text\"><i id=\"btnShowSettings' + adsEntry + 
                    '\" class=\"btnShowSettings fa fa-angle-down\" aria-hidden=\"true\"></i></a></span></td>';
                console.log('btnShowSettings: ',btnShowSettings);

                let btnActionSave = '<span class=\"\"><button type=\"button\" class=\"btn btn-secondary btn-rounded btn-sm my-0\"><i class=\"fa fa-save mt-0\"></i></button></span>';
                console.log('btnActionSave: ',btnActionSave);

                let btnActionDel = '<span class=\"\"><button type=\"button\" class=\"btn btn-danger btn-rounded btn-sm my-0\"><i class=\"fa fa-trash mt-0\"></i></button></span>';
                console.log('btnActionDel: ',btnActionDel);

                let btnActionRestore = '<span class=\"\"><button type=\"button\" class=\"btn btn-primary btn-rounded btn-sm my-0\"><i class=\"fa fa-retweet mt-0\"></i></button></span>';
                console.log('btnActionRestore: ',btnActionRestore);

                let linesRow = ads_tr + ads_th +
                    '<td class=\"pt-3-half\" contenteditable=\"false\">Pending</td>' +
                    '<td>' + adsKey.name + '</td>' + 
                    btnShowTargeting + btnShowSupply + btnShowCreative + btnShowSettings + linesPosition +
                    '<td class="pt-3-half" contenteditable="false">Pending</td>' +
                    '<td>' + btnActionSave + btnActionDel + btnActionRestore + '</td>' +
                '</tr>';
                console.log('linesRow: ',linesRow);

                // Lines Table
                $('#campaignLinesTable tbody').append(linesRow);

                // Details Table
                // Targeting/targetingID
                let details_td_targetingID = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingID' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + '\">' + 'Pending</td>';
                console.log('details_td_targetingID: ',details_td_targetingID);
                $('#targetingID_tr').append(details_td_targetingID);

                // Targeting/targetingCountry
                console.log('adsKey.targeting.country_ids: ',adsKey.targeting.country_ids);
                let targetingCountry_key = JSON.stringify(adsKey.targeting.country_ids).replace(/^\[|]$/g, '');
                let details_td_targetingCountry = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingCountry_key + '</td>';
                console.log('details_td_targetingCountry: ',details_td_targetingCountry);
                $('#targetingCountry_tr').append(details_td_targetingCountry);

                // Targeting/targetingRegions
                console.log('adsKey.targeting.geographic_ids: ',adsKey.targeting.geographic_ids);
                let targetingRegions_key = JSON.stringify(adsKey.targeting.geographic_ids).replace(/^\[|]$/g, '');
                let details_td_targetingRegions = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingRegions_key + '</td>';
                console.log('details_td_targetingRegions: ',details_td_targetingRegions);
                $('#targetingRegions_tr').append(details_td_targetingRegions);

                // Targeting/targetingGeolocations
                console.log('adsKey.targeting.geo_locations: ',adsKey.targeting.geo_locations);
                let targetingGeolocations_key = JSON.stringify(adsKey.targeting.geo_locations).replace(/^\[|]$/g, '');
                let details_td_targetingGeolocations = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\" class=\"txt-container--break-long-word wrap-geolocations\">' + targetingGeolocations_key + '</td>';
                console.log('details_td_targetingGeolocations: ',details_td_targetingGeolocations);
                $('#targetingGeolocations_tr').append(details_td_targetingGeolocations);

                // Targeting/targetingConnection
                console.log('adsKey.targeting.connection_type_ids: ',adsKey.targeting.connection_type_ids);
                let targetingConnection_key = JSON.stringify(adsKey.targeting.connection_type_ids).replace(/^\[|]$/g, '');
                let details_td_targetingConnection = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingConnection_key + '</td>';
                console.log('details_td_targetingConnection: ',details_td_targetingConnection);
                $('#targetingConnection_tr').append(details_td_targetingConnection);

                // Targeting/targetingType
                console.log('adsKey.targeting.targeting_type: ',adsKey.targeting.targeting_type);
                let targetingType_key = JSON.stringify(adsKey.targeting.targeting_type).replace(/^\[|]$/g, '');
                if (!adsKey.targeting.targeting_type) { targetingType_key = '\"all\"' };
                let details_td_targetingType = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingType_key + '</td>';
                console.log('details_td_targetingType: ',details_td_targetingType);
                $('#targetingType_tr').append(details_td_targetingType);

                // Targeting/targetingOS
                console.log('adsKey.targeting.targeting_operating_systems: ',adsKey.targeting.targeting_operating_systems);
                let targetingOS_key = JSON.stringify(adsKey.targeting.targeting_operating_systems).replace(/^\[|]$/g, '');
                if (!adsKey.targeting.targeting_operating_systems) { targetingOS_key = '' };
                let details_td_targetingOS = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingOS_key + '</td>';
                console.log('details_td_targetingOS: ',details_td_targetingOS);
                $('#targetingOS_tr').append(details_td_targetingOS);

                // Targeting/targetingDeviceType
                console.log('adsKey.targeting.device_type_ids: ',adsKey.targeting.device_type_ids);
                let targetingDeviceType_key = JSON.stringify(adsKey.targeting.device_type_ids).replace(/^\[|]$/g, '');
                if (!adsKey.targeting.device_type_ids) { targetingDeviceType_key = '' };
                let details_td_targetingDeviceType = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingDeviceType_key + '</td>';
                console.log('details_td_targetingDeviceType: ',details_td_targetingDeviceType);
                $('#targetingDeviceType_tr').append(details_td_targetingDeviceType);

                // Targeting/targetingSegment
                console.log('adsKey.targeting.targeting_segments[0].retargeting_list_id: ',adsKey.targeting.targeting_segments[0].retargeting_list_id);
                let targetingSegment_key = JSON.stringify(adsKey.targeting.targeting_segments[0].retargeting_list_id).replace(/^\[|]$/g, '');
                if (!adsKey.targeting.targeting_segments[0].retargeting_list_id) { targetingSegment_key = '' };
                let details_td_targetingSegment = '<td data-label=\"' + campaignLinesTableID + 
                '\" id=\"targetingGeolocations' + adsEntry + '\" campaignID=\"' + campaignsKey.id + 
                    '\" campaignsTableID=\"' + campaignsTableID + 
                    '\" campaignLinesTableID=\"' + campaignLinesTableID + 
                    '\">' + targetingSegment_key + '</td>';
                console.log('details_td_targetingSegment: ',details_td_targetingSegment);
                $('#targetingSegment_tr').append(details_td_targetingSegment);


            });
        });

    }
    
    fr.readAsText(files.item(0));
    $("#header-phone").show();
    $("#campaignJSONselected").show();
    $("#campaignLoad").show();
});

// Edit Details
$(document).on('click', "#editDetails", function() {
    if ($('#targetingTable').is(":visible")) {

        // Dropdown: Tartgeting/Gender
        let targetingGender = $('#targetingGender');
        targetingGender.empty();
        targetingGender.append('<select id="targetingGenderList" name="Gender"></select>');
        let targetingGenderList = $('#targetingGenderList');
        targetingGenderList.empty();
        targetingGenderList.append('<option selected="true" disabled>Choose Gender</option>');
        targetingGenderList.prop('selectedIndex', 0);

        var TARGETING_GENDER_URL = window.location.protocol + '//' + window.location.host + '/public/db/liquidm/targeting/gender.json';
        console.log(TARGETING_GENDER_URL);
        fetch(TARGETING_GENDER_URL, {
            headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(listTargetingGender) {
            console.log('listTargetingGender: ',listTargetingGender);
            console.log('listTargetingGender.ul: ',listTargetingGender.ul);
            console.log('listTargetingGender.ul.li: ',listTargetingGender.ul.li);
            console.log('listTargetingGender.ul.li[0]: ',listTargetingGender.ul.li[0]);
            console.log('listTargetingGender.ul.li[0][#text]: ',listTargetingGender.ul.li[0]['#text']);
            listTargetingGender.ul.li.forEach(function(key, entry) {
                console.log('listTargetingGender.ul.li[X]: ',key);
                //console.log('key:', key);
                console.log('entry:', entry);
                console.log('listTargetingGender.ul.li[X][text]: ',key['#text']);
                if (key['#text'] === 'all') {
                    targetingGenderList.append($('<option selected="true"></option>').attr('value', key['#text']).text(key['#text']));
                } else {
                    targetingGenderList.append($('<option></option>').attr('value', key['#text']).text(key['#text']));
                }
            });
        });

    } else if ($('#supplyTable').is(":visible")) {

    } else if ($('#creativeTable').is(":visible")) {

    } else if ($('#settingsTable').is(":visible")) {

    }
});

// APIs
// GET Campaign Info
// Click btnFormCampaign
$(document).on('click', "#btnFormCampaign", function(){
    $("#form_getcampaign").show();
    $("#form_postnewad").hide();
    $("#form_posttargeting").hide();
});
// Click btnGetCampaign
$(document).on('click', "#btnGetCampaign", function(){
    
    function loggedRequest(config) {
        return new Promise((resolve, reject) => {
            axios.request(config)
                .then((res) => {
                console.log('config: ',config);
                console.log('res: ', res);
                resolve(res);      
            })
            .catch(err => {
                console.log('error: ',error)
                reject(err);
            })
        })
    }
    
    async function getCampaign() {
        try {
            const campaignID = $("#form_getcampaign_campaignid").val();
            console.log('campaignID: ',campaignID);
            const url = '/liquidm/campaign/' + campaignID;
            console.log('url: ',url);
            $("#loader").show();
            const getCampaignAxios = await loggedRequest(url);
            //const getCampaignAll = await Promise.all([getCampaignAxios]);
            console.log('data: ',getCampaignAxios.data);
            $("#api-forms-textarea").val(JSON.stringify(getCampaignAxios.data));
            $("#loader").hide();
            $("#api-forms-textarea").show();
        } catch (e) {
            console.log('error: ',e);            
        }
    };
    getCampaign();
    
});
// POST New Ad
// Click btnFormNewAd
$(document).on('click', "#btnFormNewAd", function(){
    $("#form_postnewad").show();
    $("#form_getcampaign").hide();
    $("#form_posttargeting").hide();
});
// Click btnPostNewAd
$(document).on('click', "#btnPostNewAd", function(){
    
    function loggedRequest(config) {
        return new Promise((resolve, reject) => {
            axios.post(config)
                .then((res) => {
                console.log('config: ',config);
                console.log('res: ', res);
                resolve(res);      
            })
            .catch(err => {
                console.log('error: ',error)
                reject(err);
            })
        })
    }
    
    async function postNewAd() {
        try {
            const campaignID = $("#form_postnewad_campaignid").val();
            const campaignName = $("#form_postnewad_campaignname").val(); 
            console.log('campaignID: ',campaignID);
            console.log('campaignName: ',campaignName);
            const url = '/liquidm/newAd/campaignID/' + campaignID + '/campaignName/' + campaignName;
            console.log('url: ',url);
            $("#loader").show();
            const postNewAdAxios = await loggedRequest(url);
            //const postNewAdAll = await Promise.all([postNewAdAxios]);
            console.log('data: ',postNewAdAxios.data);
            $("#api-forms-textarea").val(JSON.stringify(postNewAdAxios.data));
            $("#loader").hide();
            $("#api-forms-textarea").show();
        } catch (e) {
            console.log('error: ',e);            
        }
    };
    postNewAd();
    
});
