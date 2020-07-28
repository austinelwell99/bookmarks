import React, { useState, useEffect } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid'
import FolderChildren from './FolderChildren'
import FolderContent from './FolderContent'

/*----------------------------------------------- APP JS ------------------------------------------------------

		- app for displaying bookmark directory
		- renders main layout and the first level of directory
		- contains main methods that are passed to other components as callbacks functions

		- dependencies:
			- FolderChildren component is for rendering all child folders in directory
			- FolderContent component is for rendering the active folder's content on the right hand side

		- methods:
			- createNewFolder
			- createNewLink
			- displayDirectory
			- toggleFolderOpen
			- contentClick
			- removeItem
			- removeFolder

--------------------------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------- global vars ------------
let rootMap = new Map()
let activeFolder
let activeRemoveFlag = false

function App() {
	//--------------------------------------------------------------------------------- local vars -------------
	let newFolderName, newLinkName, newLinkUrl
	let folderArray = []

	//--------------------------------------------------------------------------------- useState ---------------
	let [state, setState] = useState([])

	//--------------------------------------------------------------------------------- local storage ----------

	useEffect(() => {
		rootMap = new Map(JSON.parse(localStorage.getItem('rootMapStorage')))
		setState([...state])
	}, [])

	useEffect(() => {
		localStorage.setItem('rootMapStorage', JSON.stringify([...rootMap]))
	}, [state])

	//--------------------------------------------------------------------------------- methods ----------------
	function createNewFolder() {
		console.log(activeFolder)
		//for adding new folder into directory
		if (newFolderName.value) {
			//first checks if name is given
			let tempID = uuidv4()
			if (activeFolder) {
				//checks if there is an active folder...if so it makes the new folder a child of the active folder
				activeFolder.children.push(tempID)
				rootMap.set(tempID, {
					//creating new folder object w/ default values
					name: newFolderName.value,
					id: tempID,
					type: 'folder',
					isOpen: false,
					children: [],
					isRoot: false, //false because it is a child of active folder
					link: null
				})
			} else {
				//---if there is no active folder it puts the new folder at root level
				rootMap.set(tempID, {
					name: newFolderName.value,
					id: tempID,
					type: 'folder',
					isOpen: false,
					children: [],
					isRoot: true, //true because it is at root level
					link: null
				})
			}
			console.log(rootMap)
			newFolderName.value = '' //resetting input
			setState([...state])
		}
	}

	function createNewLink() {
		console.log(activeFolder)
		//for adding new link into directory, similar to createNewFolder
		if (newLinkName.value && newLinkUrl.value && activeFolder) {
			//first checks that inputs have values and there is an active folder
			let tempID = uuidv4()
			//makes new link a child of the active folder
			activeFolder.children.push(tempID)
			//creates new link object w/ default values
			rootMap.set(tempID, {
				name: newLinkName.value,
				id: tempID,
				type: 'link',
				isOpen: false,
				children: [],
				isRoot: false,
				link: newLinkUrl.value
			})
			console.log(rootMap)
			newLinkName.value = '' //resetting input
			newLinkUrl.value = 'http://'
			setState([...state])
		} else if (newLinkName.value && newLinkUrl.value) {
			//alerts you if there is no active folder
			alert('You must be inside a folder to add a bookmark.')
		}
	}

	function displayDirectory(objectIn) {
		//filters rootMap so that only root level folders are displayed at first
		//pushes them into new array that will be mapped over
		if (objectIn.type === 'folder' && objectIn.isRoot) {
			folderArray.push(objectIn)
		}
	}

	function toggleFolderOpen(objectIn) {
		if (!activeRemoveFlag) {
			//for opening and closing folders, also triggers active folder
			if (objectIn !== activeFolder) {
				//if the folder clicked on is not the active one, it becomes active
				activeFolder = objectIn
				objectIn.isOpen = true
			} else {
				//if it is already active, it closes the folder and removes active status
				// *** removing active status completely allows for the user to make new root folders ***
				objectIn.isOpen = false
				activeFolder = null
			}
		} else {
			activeRemoveFlag = false
		}
		setState([...state])
	}

	function contentClick(objectIn) {
		console.log(activeRemoveFlag)
		//called when user clicks on an object on the right side of the page
		//first makes sure they didn't click remove button
		if (!activeRemoveFlag) {
			if (objectIn.type === 'folder') {
				//if the object clicked is a folder, it sets that to active and displays its content
				objectIn.isOpen = true
				activeFolder = objectIn
			} else {
				//if the object clicked is a link, it opens the url in a new tab
				window.open(`${objectIn.link}`)
			}
		} else {
			activeRemoveFlag = false
		}
		setState([...state])
	}

	function removeItem(objectIn) {
		//removes a link object from rootMap
		activeRemoveFlag = true
		rootMap.delete(objectIn.id)
		setState([...state])
	}

	function removeFolder(objectIn) {
		//removes a folder object from rootMap
		activeRemoveFlag = true
		let confirmRemove = window.confirm(
			'Are you sure you want to delete this folder and all of its contents'
		)
		if (confirmRemove) {
			objectIn.children.map((id) => {
				rootMap.delete(id)
			})
			rootMap.delete(objectIn.id)
			activeFolder = null
		}
		setState([...state])
	}

	//------------------------------------------------------------------------------ render --------------
	return (
		<div className="App">
			{/*------------------------------------------------------ header UI ------------------*/}
			<div className="pageHeader">
				<div className="pageTitle">BOOKMARKS DIRECTORY</div>
				<div className="newFolder">
					<div className="inputLabel">Create New Folder:</div>
					<input
						type="text"
						ref={(input) => (newFolderName = input)}
						placeholder="Folder Name"
						className="inputField"
					/>
					<button onClick={createNewFolder} className="inputButton">
						Add
					</button>
				</div>
				<div className="newLink">
					<div className="inputLabel">Add New Bookmark:</div>
					<input
						type="text"
						ref={(input) => (newLinkName = input)}
						placeholder="Link Name"
						className="inputField"
					></input>
					<input
						type="text"
						ref={(input) => (newLinkUrl = input)}
						placeholder="Link URL"
						className="inputField"
						defaultValue="http://"
					></input>
					<button onClick={createNewLink} className="inputButton">
						Add
					</button>
				</div>
			</div>
			{/*----------------------------------------------------- page UI ----------------------------*/}
			<div className="pageBody">
				{/*--------------------------------- directory UI --------------*/}
				<div className="directory">
					{rootMap.size > 0 && rootMap.forEach(displayDirectory)}
					{/*first maps over the root folders and displays them*/}
					{folderArray.map((objectIn) => (
						<div className="folderContainer">
							<div
								className={
									activeFolder === objectIn ? 'activeFolder' : 'folderParent'
									//gives a different class if folder is selected
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
							{/*if any are open it calls FolderChildren to render all children*/}
							{objectIn.isOpen && (
								<div className="folderChildren">
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
				{/*-------------------- folder content UI (right side of page) --------------*/}
				<div className="folderContentRenderContainer">
					{activeFolder && (
						<FolderContent
							childrenIDArray={activeFolder.children}
							rootMap={rootMap}
							contentClick={contentClick}
							removeItem={removeItem}
							parentID={activeFolder.id}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

export default App
