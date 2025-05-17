<div class="flex flex-row-reverse">
    <button class="btn" onclick={() => document.getElementById('post-form')?.showModal()}>
        Post
    </button>
    <dialog id="post-form" class="modal modal-middle sm:modal-top">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Hello!</h3>
            <p class="py-4">Press ESC key or click the button below to close</p>
            <div class="modal-action">
                <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn">Close</button>
                </form>
            </div>
        </div>
    </dialog>
</div>
