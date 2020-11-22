//Create array
var typeOfWork = ["Additions & Remodeling", "Air Conditioning", "Appliances", "Architects & Engineers", "Audio/Visual & Computers", "Brick & Stone", 
"Cabinets", "Carpentry", "Carpets", "Ceilings", "Cleaning & Maid Services", "Concrete", "Decks", "Demolition", "Designing & Decorating", "Disaster Recovery", 
"Docks", "Doors", "Drywall & Plaster", "Electrical", "Excavation", "Fans", "Fences", "Fireplaces", "Flooring & Carpet", "Fountains & Ponds", "Furniture", "Garages", "Gutters", 
"Handyman Services", "Heating", "Home Inspection", "Home Maintenance", "Home Security", "Insulation", "Landscaping", "Locksmith", "Mold & Asbestos Services", "Moving",
"New Home Builder", "Painting", "Paving", "Pest Control", "Plumbing", "Roofing", "Septic Tanks", "Sheds & Enclosures", "Siding", "Snow Removal", "Swimming Pools", "Tile", "Tree Service", 
"Windows"
]

window.onload = function() {
    var typeOfWorkSelect = document.getElementById("typeOfWorkSelect");

    for(let i = 0; i < typeOfWork.length; i++){
        typeOfWorkSelect.options[typeOfWorkSelect.options.length] = new Option(typeOfWork[i], typeOfWork[i]);
    }
}
