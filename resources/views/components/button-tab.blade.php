<div>
    <div x-data="{ tabActive: false }">
        <button type="button" @click="tabActive = !tabActive"
            class="hover:cursor-pointer inter font-medium text-[20px] hover:bg-white w-[280px] rounded-l-[20px] h-[75px] flex justify-center items-center hover:text-[#004AAD]"
            :class="tabActive ? 'bg-white text-[#004AAD]' : 'bg-[#004AAD] text-white'">
            {{ $label }}
        </button>
    </div>
</div>
