import React from 'react'

/*------------------------------------------- FolderChildren --------------------------------------------------

		- renders all child folders in directory

		- parameters In:
			- chidrenIDArray: array containing the IDs of all children
			- rootMap: main map object (allows this component to use the IDs to get full info)
			- toggleFolderOpen: callback function that lets user open child folders (and see grandchild folders, etc)
			- activeFolder: callback function that allows any child folder to be set as the active folder
			- removeFolder: callback function that allows user to delete folder and all children
			- parentID: the ID of the folder calling this component, needed in case any children are deleted

--------------------------------------------------------------------------------------------------------------*/

function FolderChildren({
	childrenIDArray,
	rootMap,
	toggleFolderOpen,
	activeFolder,
	removeFolder,
	parentID
}) {
	//---------------------------------------------------------- local vars and filter logic -------------
	let childrenArray = []

	if (childrenIDArray) {
		//uses chidrenIDArray to get full child objects, then filters out that were deleted
		childrenArray = childrenIDArray
			.map((id) => rootMap.get(id))
			.filter((child) => child !== undefined)
	}

	if (childrenArray.length !== childrenIDArray.length) {
		//compares current array to array in, and if any were deleted it removes them from parent object
		let updatedChildrenIDArray = childrenArray.map((child) => child.id)
		let parentObject = rootMap.get(parentID)
		if (parentObject) {
			parentObject.children = updatedChildrenIDArray
			rootMap.set(parentID, parentObject)
		}
	}

	//------------------------------------------------------------------------------ render --------------
	//------almost identical to APP JS render, except is recursive

	return (
		<div>
			{childrenArray.length > 0 &&
				childrenArray
					.filter((child) => child.type === 'folder') //so no links are displayed in directory
					.map((objectIn) => (
						<div className="folderContainer">
							<div
								className={
									activeFolder === objectIn ? 'activeFolder' : 'folderParent'
								}
								onClick={() => toggleFolderOpen(objectIn)}
							>
								<i
									className={
										objectIn.isOpen
											? 'fa fa-folder-open-o icon'
											: 'fa fa-folder-o icon'
									}
								></i>
								<div className="folderName">{objectIn.name}</div>
								<div
									className={
										activeFolder === objectIn
											? 'fa fa-remove removeIconOnActive'
											: 'fa fa-remove removeIcon'
									}
									onClick={() => removeFolder(objectIn)}
								></div>
							</div>
							{objectIn.isOpen && (
								<div className="folderChildren">
									{/*--- calls itself to render all grandchildren, etc ---*/}
									<FolderChildren
										childrenIDArray={objectIn.children}
										rootMap={rootMap}
										toggleFolderOpen={toggleFolderOpen}
										activeFolder={activeFolder}
										removeFolder={removeFolder}
										parentID={objectIn.id}
									/>
								</div>
							)}
						</div>
					))}
		</div>
	)
}

export default FolderChildren
