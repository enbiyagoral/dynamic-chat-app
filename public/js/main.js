(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);

// ------------------------------------ Start Dynamic Chat App Script -----------------------

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var userData = JSON.parse(getCookie('user'));
var senderId = userData._id;
var receiverId;
var globalGroupId;

var socket = io('/user-namespace', {
	auth: {
		token: userData._id,
	}
});


$(document).ready(function() {
	$('.user-list').click(function() {
		var userId = $(this).attr('data-id');
		receiverId = userId; // receiverId'yi güncelliyoruz
		$('.start-head').hide();
		$('.chat-section').show();
		socket.emit('existsChat', { senderId: senderId, receiverId: receiverId });
	});
});


// update user online -status
socket.on('getOnlineUser', function(data){
	$('#'+data.user_id+'-status').text('Online');
	$('#'+data.user_id+'-status').removeClass('offline-status');
	$('#'+data.user_id+'-status').addClass('online-status');
});

socket.on('getOfflineUser', function(data){
	$('#'+data.user_id+'-status').text('Offline');
	$('#'+data.user_id+'-status').removeClass('online-status');
	$('#'+data.user_id+'-status').addClass('offline-status');
});

// chat save of user

$("#chat-form").submit(function(e){
	e.preventDefault();
	var message = $('#message').val();
	$.ajax({
		url: '/save-chat',
		type: 'POST',
		data: {  senderId: senderId, receiverId: receiverId, message: message },
		success: function(response){
			if(response.success){
				$('#message').val('');
				let chat = response.data.message;
				let html = `
				<div class="current-user-chat" id="${response.data._id}">
					<h5><span>${chat}</span>
						<i class="fa fa-trash" aria-hidden="true" data-id='${response.data._id}' data-toggle="modal" data-target="#deleteChatModal"></i>
						<i class="fa fa-edit" aria-hidden="true" data-id='${response.data._id}' data-msg="${chat}" data-toggle="modal" data-target="#editChatModal"></i>
						</h5>    
				</div>`;
				$('#chat-container').append(html); 
				socket.emit('newChat', response.data);
				scrollChat();

			}else{
				alert(data.msg);
			}
		}
		
	}
	);
});

socket.on('loadNewChat', function(data){
	
	if(senderId == data.receiverId && receiverId == data.senderId){
		let html = `
		<div class="distance-user-chat" id="${data._id}">
			<h5><span>${data.message}</span>
				
			</h5>    
		</div>`;
	$('#chat-container').append(html);   
	scrollChat();

	}
});

// load old chats 
socket.on('loadChats', function(data){
	$('#chat-container').html('');
	var chats = data.chats;
	let html = "";

	for(let x=0; x < chats.length; x++){
		let addClass = '';
		if(chats[x].senderId == senderId){
			addClass = 'current-user-chat';
		}else{
			addClass = 'distance-user-chat';
		}

		html +=` 
		<div class=${addClass} id="${chats[x]._id}">
			<h5><span>${chats[x].message}</span>`;

		if(chats[x].senderId == senderId){
			html += `
			<i class="fa fa-trash" aria-hidden="true" data-id="${chats[x]._id}" data-toggle="modal" data-target="#deleteChatModal"></i>
			<i class="fa fa-edit" aria-hidden="true" data-id="${chats[x]._id}" data-msg="${chats[x].message}" data-toggle="modal" data-target="#editChatModal"></i>
			`;
		}     

		html +=   ` </h5>    
		</div>`;
	};
	$('#chat-container').append(html);
	scrollChat();
})

function scrollChat(){
	$('#chat-container').animate({
		scrollTop: $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight
	},0)
}

function scrollGroupChat(){
	$('#group-chat-container').animate({
		scrollTop: $('#group-chat-container').offset().top + $('#group-chat-container')[0].scrollHeight
	},0)
}

// delete chat work

$(document).on("click",".fa-trash", function(){
	let msg = $(this).parent().text();
	$('#delete-message').text(msg);
	$('#delete-message-id').val($(this).attr('data-id'));

});

$('#delete-chat-form').submit(function(event){
	event.preventDefault();
	var id = $('#delete-message-id').val();

	$.ajax({
		url: '/delete-chat',
		type: 'POST',
		data: {id},
		success: function(res){
			if(res.success = true){
				$('#'+id).remove();
				$('#deleteChatModal').modal('hide');
				socket.emit('chatDeleted',id);
			}else{
				alert(res.msg);
			}
		}
	})
});

socket.on('chatMessageDeleted', function(id){
	$('#'+id).remove();
});

$(document).on("click", '.fa-edit', function(){
	$('#edit-message-id').val($(this).attr('data-id'));
	$('#update-message').val($(this).attr('data-msg'));
})

$('#update-chat-form').submit(function(event){
	event.preventDefault();
	var id = $('#edit-message-id').val();
	var msg = $('#update-message').val();
	$.ajax({
		url: '/update-chat',
		type: 'POST',
		data: {id: id,message: msg},
		success: function(res){
			if(res.success = true){
				$('#editChatModal').modal('hide');
				const a = $('#'+id).find('span').text(msg);
				$('#'+id).find('.fa-edit').attr('data-msg',msg);
				socket.emit('chatUpdated',{id:id,message:msg});
			}else{
				alert(res.msg);
			}
		}
	})
});

socket.on('chatMessageUpdated', function(data){
	$('#'+data.id).find('span').text(data.message);
})


$('.addMember').click(function(){
	var id = $(this).attr('data-id');
	var limit = $(this).attr('data-limit');

	$('#group_Id').val(id);
	$('#limit').val(limit);
	$.ajax({
		url: '/get-members',
		type: 'POST',
		data: { group_Id: id},
		success: function(res){
			if(res.success == true){
				let users = res.data;
				let html = '';

				for(let i=0; i<users.length; i++){
					let isMemberOfGroup = users[i].member.length > 0? true:false;

					html += `
					<tr> 
						<td>
							<input type="checkbox" ${isMemberOfGroup?'checked':''} name="members[]" value="${users[i]._id}" />
						</td>
						<td> ${users[i].name} </td>
					</tr>`
				}

				$('.addMembersInTable').html(html);

			}else{
				alert(res.msg);
			}
		}
	})
});

// add member form submit code
$('#add-member-form').submit(function(e){
	e.preventDefault();
	var formData = $(this).serialize();

	$.ajax({
		url : '/add-members',
		type: 'POST',
		data : formData,
		success: function(res){
			if(res.success){
				$('#memberModal').modal('hide');
				$('#add-member-form')[0].reset();
				alert(res.msg);
			}else{
				$('#add-member-error').text(res.msg);
				setTimeout(()=>{
					$('#add-member-error').text('');
				},3000);
			}
		}
	})
});


// update group script
$('.updateMember').click(function(){

	var obj = JSON.parse($(this).attr('data-obj'));
	$('#groupId').val(obj._id);
	$('#lastLimit').val(obj.limit);
	$('#groupName').val(obj.name);

});

$('#updateChatGroupForm').submit(function(e){
	e.preventDefault();
	$.ajax({
		url: "/update-chat-group",
		type: "POST",
		data: new FormData(this),
		contentType: false,
		cache: false,
		processData : false,
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}
		}
	});
})

$('.deleteGroup').click(function(){
	$('#deleteGroupId').val($(this).attr('data-id'));
	$('#deleteGroupName').text($(this).attr('data-name'));

});

$('#deleteChatGroupForm').submit(function(e){
	e.preventDefault();
	var formData = $(this).serialize();
	$.ajax({
		url: '/delete-chat-group',
		type: 'POST',
		data : formData,
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}
		}
	})
});

$('.copy').click(function(){
	$(this).prepend('<span class="copied_text"> Copied </span>');
	var group_id = $(this).attr('data-id');
	var url = window.location.host + '/share-group/' + group_id;
	var temp = $("<input>");
	$("body").append(temp);
	temp.val(url).select();
	document.execCommand("copy");
	temp.remove();
	setTimeout(()=>{
		$('.copied_text').remove();
	},2000);
});


// join group script

$('.join-now').click(function(){
	$(this).text('Wait...');
	$(this).attr('disabled','disabled')
	const groupId = $(this).attr('data-id');
	$.ajax({
		url: "/join-group",
		type: "POST",
		data: { groupId },
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}else{
				$(this).text('Join Now');
				$(this).removeAttr('disabled');
			}
		}
	});

});


// --------------- Group Chattting Script

$('.group-list').click(function(){
	$('.group-start-head').hide();
	$('.group-chat-section').show();

	globalGroupId = $(this).attr('data-id');
	loadGroupChats();
});

$("#group-chat-form").submit(function(e){
	e.preventDefault();
	var message = $('#group-message').val();
	$.ajax({
		url: '/group-chat-save',
		type: 'POST',
		data: {  senderId, groupId:globalGroupId, message},
		success: function(response){
			if(response.success){
				
				let message = response.chat.message;
				let html = `
				<div class="current-user-chat" id="${response.chat._id}">
					<h5>
						<span>${message}</span>
						<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='${response.chat._id}' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
						<i class="fa fa-edit editGroupChat" aria-hidden="true" 
						data-id='${response.chat._id}' 
						data-msg="${message}" 
						data-toggle="modal" 
						data-target="#editChatGroupModal"></i>
					</h5>    
				</div>`;
				$('#group-chat-container').append(html);   
				socket.emit('newGroupChat',response.chat);
				scrollGroupChat();
				$('#group-message').val('');


			}else{
				alert(res.msg);
			}
		}
		
	}
	);
});

socket.on('loadNewGroupChat',function(data){
	if(globalGroupId==data.groupId){
		let html = `
			<div class="distance-user-chat" id="${data._id}">
				<h5>
					<span>${data.message}</span>
				</h5>    
			</div>`;
			$('#group-chat-container').append(html);  
			scrollGroupChat(); 
	};

});

function loadGroupChats(){
	$.ajax({
		url: "/load-group-chats",
		type: "POST",
		data: { groupId:globalGroupId },
		success: function(res){
			if(res.success){
				var chats = res.chats;
				var html = '';

				for(let i=0; i<chats.length; i++){
					let className = 'distance-user-chat';
					if(chats[i].senderId == senderId){
						className = 'current-user-chat';
					}

					html += `
					<div class='${className}' id="${chats[i]._id}">
						<h5>
							<span>${chats[i].message}</span>`;

					if(chats[i].senderId == senderId){
						html += `<i class="fa fa-trash deleteGroupChat" aria-hidden="true" 
						data-id='${chats[i]._id}'
						data-toggle="modal" 
						data-target="#deleteGroupChatModal"></i>
						<i class="fa fa-edit editGroupChat" aria-hidden="true" 
						data-id='${chats[i]._id}' 
						data-msg="${chats[i].message}" 
						data-toggle="modal" 
						data-target="#editChatGroupModal"></i>
						
						`;
					};
					html += `
						</h5>
					</div>
					`};

				$('#group-chat-container').html(html);
				scrollGroupChat();

			}else{
				alert(res.msg);
			}
		}
	});
};

$(document).on('click','.deleteGroupChat', function(){
	var msg = $(this).parent().find('span').text();
	$('#delete-group-message').text(msg);
	$('#delete-group-message-id').val($(this).attr('data-id'));


});

$('#delete-group-chat-form').submit(function(e){
	e.preventDefault();
	var id = $('#delete-group-message-id').val();
	$.ajax({
		url : '/delete-group-chat',
		type : 'POST',
		data : {id},
		success : function(res){
			if(res.success){
				$('#'+id).remove();
				$('#deleteGroupChatModal').modal('hide');
				socket.emit('groupChatDeleted', id);
			}else{
				alert(res.msg);	
			}
		}
	})

});

// listedn delete chat id using socket

socket.on('groupChatMessageDeleted', function(data){
	$('#'+data).remove();
})


$(document).on('click','.editGroupChat', function(){
	$('#edit-group-message-id').val($(this).attr('data-id'));
	$('#update-group-message').val($(this).attr('data-msg'));

});

$('#update-group-chat-form').submit(function(e){
	e.preventDefault();

	var id = $('#edit-group-message-id').val();
	var message = $("#update-group-message").val();
	console.log(message,id);
	$.ajax({
		url : '/update-group-chat',
		type: 'POST',
		data: {id,message},
		success: function(res){
			if(res.success){
				$("#editChatGroupModal").modal('hide');
				$("#"+id).find('span').text(message);
				$("#"+id).find('.editGroupChat').attr('data-msg',message);
				socket.emit('groupChatUpdated',{id,message});

			}else{
				alert(res.msg);
			};
		}
	});
});

socket.on("groupChatMessageUpdated",function(data){
	$("#"+data.id).find('span').text(data.message);
	$("#"+id).find('.editGroupChat').attr('data-msg',message);
})


