# frozen_string_literal: true

module ::DiscoursePostFolding
  class PostFoldingStatus < ::ActiveRecord::Base
    belongs_to :post
    belongs_to :user
  end
end

# == Schema Information
#
# Table name: discourse_post_folding_post_folding_statuses
#
#  id         :bigint           not null, primary key
#  post_id    :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_discourse_post_folding_post_folding_statuses_on_post_id  (post_id)
#
