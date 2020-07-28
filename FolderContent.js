import React from 'react'

/*------------------------------------------- FolderContent ---------------------------------------------------

		- renders all contents of active folder (links and child folders) on right side of page

		- parameters In:
			- chidrenIDArray: array containing the IDs of all children in active folder
			- rootMap: main map object (allows this component to use the IDs to get full info)
			- contentClick: callback function that lets user click on any object
				- if link, will open in new tab
				- if folder, will set as active folder and open
			- removeItem: callback function that will remove link *** not implemented yet
			- parentID: the ID of the folder calling this component, needed in case any children are deleted

--------------------------------------------------------------------------------------------------------------*/

function FolderContent({
	childrenIDArray,
	rootMap,
	contentClick,
	removeItem,
	parentID
}) {
	//
	//---------------------------------------------------------- local vars and filter logic -------------
	let childrenArray = []
	let parentObject = rootMap.get(parentID)

	if (childrenIDArray) {
		//uses chidrenIDArray to get full child objects and filters out any that were deleted
		childrenArray = childrenIDArray
			.map((id) => rootMap.get(id))
			.filter((child) => child !== undefined)
	}

	if (childrenArray.length !== childrenIDArray.length) {
		//compares current array to array in, and if any were deleted it removes them from parent object
		let updatedChildrenIDArray = childrenArray.map((child) => child.id)
		if (parentObject) {
			parentObject.children = updatedChildrenIDArray
			rootMap.set(parentID, parentObject)
		}
	}

	//------------------------------------------------------------------------------ render --------------
	return (
		<div className="folderContentContainer">
			{childrenArray.length > 0 &&
				childrenArray.map((objectIn) => (
					<div className="listItem" onClick={() => contentClick(objectIn)}>
						<div
							className={
								objectIn.type === 'folder'
									? 'fa fa-folder-o icon'
									: 'fa fa-link linkIcon'
								//gets icon depending on its type
							}
						/>
						<div className="listItemName">{objectIn.name}</div>
						<div className={objectIn.link ? 'linkText' : 'linkHidden'}>
							{objectIn.link}
						</div>
						<div
							className={
								objectIn.link ? 'fa fa-remove removeIcon' : 'linkHidden'
							}
							onClick={() => removeItem(objectIn)}
						></div>
					</div>
				))}
			{childrenArray.length == 0 && parentObject && (
				<div className="noItemsContainer">
					<div className="noItems">{`No Items In ${parentObject.name}`}</div>
				</div>
			)}
		</div>
	)
}

export default FolderContent
